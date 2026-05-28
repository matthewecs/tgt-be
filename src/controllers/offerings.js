const db = require('../config/db');
const { ok, fail } = require('../helpers/response');
const { hasPermission } = require('../middleware/auth');
const { generateOfferingPDF } = require('../helpers/pdf');

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

    const { rows: items } = await db.query(
      'SELECT * FROM offering_items WHERE offering_id = $1 ORDER BY sort_order, id',
      [offering.id]
    );

    offering.items = items.map(item => {
      if (!canReadConfidential) {
        const { buying_price, buying_currency, ...rest } = item;
        return rest;
      }
      return item;
    });

    const totals = await computeTotals(offering.id);
    Object.assign(offering, totals);

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
        `INSERT INTO offerings (title, customer_id, template_id, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, customer_id, template_id || null, req.user.id]
      );
      const offering = rows[0];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Validate quantity against template_min_quantity
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

        await client.query(
          `INSERT INTO offering_items
             (offering_id, template_item_id, item_name, quantity, template_min_quantity,
              selling_price, selling_currency, buying_price, buying_currency, is_mandatory, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            offering.id, item.template_item_id ?? null, item.item_name, item.quantity,
            templateMinQty,
            item.selling_price ?? null, item.selling_currency || 'IDR',
            item.buying_price ?? null, item.buying_currency || 'IDR',
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
    if (offering.submitted_at) {
      return fail(res, 409, 'Offering is locked pending review');
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
              item.selling_price ?? null, item.selling_currency ?? null,
              item.buying_price ?? null, item.buying_currency ?? null,
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
              item.selling_price ?? null, item.selling_currency || 'IDR',
              item.buying_price ?? null, item.buying_currency || 'IDR',
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
    const { rows } = await db.query('SELECT * FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const o = rows[0];
    if (o.submitted_at) return fail(res, 400, 'Offering is already submitted');
    if (o.approved_at) return fail(res, 400, 'Offering is already approved');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE offerings SET submitted_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
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
    const { rows } = await db.query('SELECT * FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE offerings SET approved_at = NOW(), reviewed_by = $1, updated_at = NOW() WHERE id = $2',
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
    const { rows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE offerings SET submitted_at = NULL, updated_at = NOW() WHERE id = $1',
        [id]
      );
      await addLog(client, id, req.user.id, 'rejected', reason || null);
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
    const { rows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE offerings SET submitted_at = NULL, updated_at = NOW() WHERE id = $1',
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

const VALID_STATUSES = ['offering', 'deal', 'on_planning', 'on_going', 'done'];

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return fail(res, 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const { rows } = await db.query('SELECT status FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const oldStatus = rows[0].status;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE offerings SET status = $1::offering_status, updated_at = NOW() WHERE id = $2`,
        [status, id]
      );
      await addLog(client, id, req.user.id, 'status_changed', `${oldStatus} → ${status}`);
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

    const { rowCount } = await db.query(
      'UPDATE offering_items SET owner_comment = $1 WHERE id = $2 AND offering_id = $3',
      [comment || null, item_id, id]
    );
    if (!rowCount) return fail(res, 404, 'Item not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await addLog(client, id, req.user.id, 'item_commented', `item_id: ${item_id}`);
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
    const canReadAll = hasPermission(req.user, 'offering:read_all');

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

    // Workers can only generate PDF after approval
    if (!canReadAll && !offering.approved_at) {
      return fail(res, 403, 'PDF is only available after the offering is approved');
    }

    const { rows: items } = await db.query(
      'SELECT item_name, quantity, selling_price, selling_currency FROM offering_items WHERE offering_id = $1 ORDER BY sort_order, id',
      [id]
    );
    offering.items = items;

    const totals = await computeTotals(id);
    offering.total_revenue = totals.total_revenue;

    const pdfBuffer = await generateOfferingPDF(offering);

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
