const db = require('../config/db');
const { ok, fail } = require('../helpers/response');
const { hasPermission } = require('../middleware/auth');
const { generateOfferingPDF } = require('../helpers/pdf');

// Converts empty string / undefined to null for NUMERIC columns
const num = (v) => (v === '' || v === undefined ? null : v);

// Statuses where the worker may edit the offering
const EDITABLE_STATUSES = ['draft', 'need_revise'];

// Statuses where the PDF may be downloaded
const PDF_ALLOWED_STATUSES = ['approved', 'offering', 'on_going', 'done'];

// Manual status progression (owner/admin only, sequential)
const STATUS_NEXT = { offering: 'on_going', on_going: 'done' };

async function computeTotals(offeringId) {
  const [capRows, revRows] = await Promise.all([
    db.query(
      `SELECT buying_currency AS currency, SUM(quantity * buying_price) AS total
       FROM offering_items WHERE offering_id = $1 GROUP BY buying_currency`,
      [offeringId]
    ),
    db.query(
      `SELECT selling_currency AS currency, SUM(quantity * selling_price) AS total
       FROM offering_items WHERE offering_id = $1 GROUP BY selling_currency`,
      [offeringId]
    ),
  ]);
  return {
    total_capital: Object.fromEntries(capRows.rows.map(r => [r.currency, Number(r.total)])),
    total_revenue: Object.fromEntries(revRows.rows.map(r => [r.currency, Number(r.total)])),
  };
}

async function addLog(client, offeringId, userId, action, details) {
  await client.query(
    'INSERT INTO offering_logs (offering_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
    [offeringId, userId, action, details || null]
  );
}

exports.list = async (req, res) => {
  try {
    const canReadAll = hasPermission(req.user, 'offering:read_all');
    const canReadConfidential = hasPermission(req.user, 'offering:read_confidential');

    let sql = `
      SELECT o.*, u.name AS created_by_name,
             json_build_object('id', c.id, 'company_name', c.company_name) AS customer
      FROM offerings o
      LEFT JOIN users u ON u.id = o.created_by
      LEFT JOIN customers c ON c.id = o.customer_id
    `;
    const params = [];

    if (!canReadAll) {
      sql += ' WHERE o.created_by = $1';
      params.push(req.user.id);
    }
    sql += ' ORDER BY o.created_at DESC';

    const { rows } = await db.query(sql, params);

    if (canReadConfidential) {
      for (const o of rows) {
        const totals = await computeTotals(o.id);
        Object.assign(o, totals);
      }
    }

    return ok(res, rows);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getById = async (req, res) => {
  try {
    const canReadAll = hasPermission(req.user, 'offering:read_all');
    const canReadConfidential = hasPermission(req.user, 'offering:read_confidential');

    const { rows } = await db.query(`
      SELECT o.*,
             json_build_object(
               'id', c.id, 'company_name', c.company_name, 'city', c.city,
               'contact_name', c.contact_name, 'phone', c.phone, 'email', c.email
             ) AS customer,
             u.name AS created_by_name
      FROM offerings o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users u ON u.id = o.created_by
      WHERE o.id = $1
    `, [req.params.id]);

    if (!rows[0]) return fail(res, 404, 'Offering not found');
    const offering = rows[0];

    if (!canReadAll && offering.created_by !== req.user.id) {
      return fail(res, 403, 'Access denied');
    }

    const [itemRows, logRows] = await Promise.all([
      db.query(
        'SELECT * FROM offering_items WHERE offering_id = $1 ORDER BY sort_order, id',
        [offering.id]
      ),
      db.query(
        `SELECT l.id, l.action, l.details, l.created_at, l.user_id, u.name AS user_name
         FROM offering_logs l
         LEFT JOIN users u ON u.id = l.user_id
         WHERE l.offering_id = $1
         ORDER BY l.created_at ASC`,
        [offering.id]
      ),
    ]);

    offering.items = itemRows.rows.map(item => {
      if (!canReadConfidential) {
        const { buying_price, buying_currency, ...rest } = item;
        return rest;
      }
      return item;
    });

    offering.logs = logRows.rows;

    const totals = await computeTotals(offering.id);
    if (canReadConfidential) {
      Object.assign(offering, totals);
    } else {
      offering.total_revenue = totals.total_revenue;
    }

    return ok(res, offering);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.create = async (req, res) => {
  try {
    const { title, customer_id, template_id, items = [] } = req.body;
    if (!title || !customer_id) return fail(res, 400, 'title and customer_id are required');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO offerings (title, customer_id, template_id, created_by, status)
         VALUES ($1, $2, $3, $4, 'draft') RETURNING *`,
        [title, customer_id, template_id || null, req.user.id]
      );
      const offering = rows[0];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        let templateMinQty = null;
        let templateBuyingPrice = null;
        let templateBuyingCurrency = 'IDR';
        if (item.template_item_id) {
          const { rows: ti } = await client.query(
            'SELECT quantity, actual_price, actual_price_currency FROM template_items WHERE id = $1',
            [item.template_item_id]
          );
          if (ti[0]) {
            templateMinQty = ti[0].quantity;
            templateBuyingPrice = ti[0].actual_price;
            templateBuyingCurrency = ti[0].actual_price_currency || 'IDR';
          }
        }

        if (templateMinQty !== null && item.quantity < templateMinQty) {
          await client.query('ROLLBACK');
          return fail(res, 422, `Item "${item.item_name}" quantity must be at least ${templateMinQty}`);
        }

        const buyingPrice = num(item.buying_price) ?? templateBuyingPrice;
        const buyingCurrency = (item.buying_currency && item.buying_currency !== '') ? item.buying_currency : templateBuyingCurrency;

        await client.query(
          `INSERT INTO offering_items
             (offering_id, template_item_id, item_name, quantity, template_min_quantity,
              selling_price, selling_currency, buying_price, buying_currency, is_mandatory, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            offering.id, item.template_item_id ?? null, item.item_name, item.quantity,
            templateMinQty,
            num(item.selling_price), item.selling_currency || 'IDR',
            buyingPrice, buyingCurrency,
            item.is_mandatory ?? true, item.sort_order ?? i,
          ]
        );
      }

      await addLog(client, offering.id, req.user.id, 'created', null);
      await client.query('COMMIT');
      return ok(res, { id: offering.id });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { items = [] } = req.body;

    const { rows } = await db.query('SELECT * FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const offering = rows[0];
    if (!EDITABLE_STATUSES.includes(offering.status)) {
      return fail(res, 409, `Offering cannot be edited in status "${offering.status}"`);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const incomingIds = items.filter(i => i.id).map(i => i.id);
      if (incomingIds.length > 0) {
        await client.query(
          `DELETE FROM offering_items WHERE offering_id = $1 AND id != ALL($2::int[])`,
          [id, incomingIds]
        );
      } else {
        await client.query('DELETE FROM offering_items WHERE offering_id = $1', [id]);
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        let templateMinQty = null;
        if (item.template_item_id) {
          const { rows: ti } = await client.query(
            'SELECT quantity FROM template_items WHERE id = $1',
            [item.template_item_id]
          );
          if (ti[0]) templateMinQty = ti[0].quantity;
        }

        if (templateMinQty !== null && item.quantity < templateMinQty) {
          await client.query('ROLLBACK');
          return fail(res, 422, `Item "${item.item_name}" quantity must be at least ${templateMinQty}`);
        }

        if (item.id) {
          await client.query(
            `UPDATE offering_items SET
               item_name = COALESCE($1, item_name),
               quantity = COALESCE($2, quantity),
               selling_price = COALESCE($3, selling_price),
               selling_currency = COALESCE($4, selling_currency),
               buying_price = COALESCE($5, buying_price),
               buying_currency = COALESCE($6, buying_currency),
               is_mandatory = COALESCE($7, is_mandatory),
               sort_order = COALESCE($8, sort_order)
             WHERE id = $9 AND offering_id = $10`,
            [
              item.item_name ?? null, item.quantity ?? null,
              num(item.selling_price), item.selling_currency ?? null,
              num(item.buying_price), item.buying_currency ?? null,
              item.is_mandatory ?? null, item.sort_order ?? i,
              item.id, id,
            ]
          );
        } else {
          await client.query(
            `INSERT INTO offering_items
               (offering_id, template_item_id, item_name, quantity, template_min_quantity,
                selling_price, selling_currency, buying_price, buying_currency, is_mandatory, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [
              id, item.template_item_id ?? null, item.item_name, item.quantity,
              templateMinQty,
              num(item.selling_price), item.selling_currency || 'IDR',
              num(item.buying_price), item.buying_currency || 'IDR',
              item.is_mandatory ?? true, item.sort_order ?? i,
            ]
          );
        }
      }

      await client.query('UPDATE offerings SET updated_at = NOW() WHERE id = $1', [id]);
      await addLog(client, id, req.user.id, 'updated', null);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.submit = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    if (!EDITABLE_STATUSES.includes(rows[0].status)) {
      return fail(res, 400, `Cannot submit an offering with status "${rows[0].status}"`);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = 'on_review', updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await addLog(client, id, req.user.id, 'submitted', null);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    if (rows[0].status !== 'on_review') {
      return fail(res, 400, `Can only approve offerings with status "on_review"`);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = 'approved', approved_at = NOW(), reviewed_by = $1, updated_at = NOW() WHERE id = $2`,
        [req.user.id, id]
      );
      await addLog(client, id, req.user.id, 'approved', null);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    if (rows[0].status !== 'on_review') {
      return fail(res, 400, `Can only decline offerings with status "on_review"`);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = 'declined', updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await addLog(client, id, req.user.id, 'declined', reason || null);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.revision = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    if (rows[0].status !== 'on_review') {
      return fail(res, 400, `Can only request revision on offerings with status "on_review"`);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = 'need_revise', updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await addLog(client, id, req.user.id, 'revision_requested', comment || null);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const currentStatus = rows[0].status;
    const expectedNext = STATUS_NEXT[currentStatus];

    if (!expectedNext || status !== expectedNext) {
      return fail(res, 422,
        expectedNext
          ? `Status must advance to "${expectedNext}" from "${currentStatus}"`
          : `Status "${currentStatus}" cannot be manually advanced`
      );
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = $1::offering_status, updated_at = NOW() WHERE id = $2`,
        [status, id]
      );
      await addLog(client, id, req.user.id, 'status_changed', `${currentStatus} → ${status}`);
      await client.query('COMMIT');
      return ok(res, null);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.itemComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_id, comment } = req.body;
    if (!item_id) return fail(res, 400, 'item_id is required');

    const { rows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const { rows: itemRows } = await db.query(
      'SELECT item_name FROM offering_items WHERE id = $1 AND offering_id = $2',
      [item_id, id]
    );
    if (!itemRows[0]) return fail(res, 404, 'Item not found');

    await db.query(
      'UPDATE offering_items SET owner_comment = $1 WHERE id = $2 AND offering_id = $3',
      [comment || null, item_id, id]
    );

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await addLog(client, id, req.user.id, 'item_commented',
        `${itemRows[0].item_name}: ${(comment || '').slice(0, 100)}`
      );
      await client.query('COMMIT');
    } finally {
      client.release();
    }

    return ok(res, null);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const { rows: logs } = await db.query(`
      SELECT l.*, u.name AS user_name
      FROM offering_logs l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE l.offering_id = $1
      ORDER BY l.created_at ASC
    `, [id]);

    return ok(res, logs);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(`
      SELECT o.*,
             json_build_object(
               'id', c.id, 'company_name', c.company_name, 'city', c.city,
               'contact_name', c.contact_name, 'phone', c.phone, 'email', c.email
             ) AS customer
      FROM offerings o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `, [id]);

    if (!rows[0]) return fail(res, 404, 'Offering not found');
    const offering = rows[0];

    if (!PDF_ALLOWED_STATUSES.includes(offering.status)) {
      return fail(res, 403, `PDF is not available in status "${offering.status}"`);
    }

    const { rows: items } = await db.query(
      `SELECT item_name, quantity, selling_price, selling_currency, is_mandatory
       FROM offering_items WHERE offering_id = $1 ORDER BY sort_order, id`,
      [id]
    );
    offering.items = items;

    const totals = await computeTotals(id);
    offering.total_revenue = totals.total_revenue;

    const pdfBuffer = await generateOfferingPDF(offering);

    // Auto-advance from 'approved' → 'offering' on first download
    if (offering.status === 'approved') {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE offerings SET status = 'offering', updated_at = NOW() WHERE id = $1`,
          [id]
        );
        await addLog(client, id, req.user.id, 'pdf_generated', null);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to advance status after PDF generation:', e);
      } finally {
        client.release();
      }
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="offering-${id}.pdf"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    return res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
