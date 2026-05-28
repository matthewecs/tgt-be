const db = require('../config/db');
const { ok, fail } = require('../helpers/response');
const { hasPermission } = require('../middleware/auth');

const CONFIDENTIAL_FIELDS = ['price_range_min', 'price_range_max', 'price_range_currency', 'actual_price', 'actual_price_currency'];

function stripConfidential(item) {
  const out = { ...item };
  CONFIDENTIAL_FIELDS.forEach(f => delete out[f]);
  return out;
}

async function getTemplateWithItems(id, canReadConfidential) {
  const { rows } = await db.query('SELECT * FROM offering_templates WHERE id = $1', [id]);
  if (!rows[0]) return null;

  const { rows: items } = await db.query(
    'SELECT * FROM template_items WHERE template_id = $1 ORDER BY sort_order, id',
    [id]
  );

  const template = rows[0];
  template.items = canReadConfidential ? items : items.map(stripConfidential);
  return template;
}

exports.list = async (req, res) => {
  try {
    const canReadConfidential = hasPermission(req.user, 'template:read_confidential');
    const { rows } = await db.query('SELECT * FROM offering_templates ORDER BY id DESC');

    for (const t of rows) {
      const { rows: items } = await db.query(
        'SELECT * FROM template_items WHERE template_id = $1 ORDER BY sort_order, id',
        [t.id]
      );
      t.items = canReadConfidential ? items : items.map(stripConfidential);
    }

    return ok(res, rows);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getById = async (req, res) => {
  try {
    const canReadConfidential = hasPermission(req.user, 'template:read_confidential');
    const template = await getTemplateWithItems(req.params.id, canReadConfidential);
    if (!template) return fail(res, 404, 'Template not found');
    return ok(res, template);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, items = [] } = req.body;
    if (!title) return fail(res, 400, 'title is required');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'INSERT INTO offering_templates (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
        [title, description || null, req.user.id]
      );
      const template = rows[0];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO template_items
             (template_id, item_name, price_range_min, price_range_max, price_range_currency,
              actual_price, actual_price_currency, quantity, is_mandatory, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            template.id, item.item_name,
            item.price_range_min ?? null, item.price_range_max ?? null,
            item.price_range_currency || 'IDR',
            item.actual_price ?? null, item.actual_price_currency || 'IDR',
            item.quantity ?? 1, item.is_mandatory ?? true, item.sort_order ?? i,
          ]
        );
      }
      await client.query('COMMIT');
      return ok(res, { id: template.id });
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
    const { title, description, items = [] } = req.body;

    const { rows: existing } = await db.query('SELECT id FROM offering_templates WHERE id = $1', [id]);
    if (!existing[0]) return fail(res, 404, 'Template not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      if (title || description !== undefined) {
        await client.query(
          `UPDATE offering_templates SET
             title = COALESCE($1, title),
             description = COALESCE($2, description)
           WHERE id = $3`,
          [title || null, description ?? null, id]
        );
      }

      // Replace items: delete all then re-insert
      await client.query('DELETE FROM template_items WHERE template_id = $1', [id]);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO template_items
             (template_id, item_name, price_range_min, price_range_max, price_range_currency,
              actual_price, actual_price_currency, quantity, is_mandatory, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            id, item.item_name,
            item.price_range_min ?? null, item.price_range_max ?? null,
            item.price_range_currency || 'IDR',
            item.actual_price ?? null, item.actual_price_currency || 'IDR',
            item.quantity ?? 1, item.is_mandatory ?? true, item.sort_order ?? i,
          ]
        );
      }
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

exports.remove = async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM offering_templates WHERE id = $1', [req.params.id]);
    if (!rowCount) return fail(res, 404, 'Template not found');
    return ok(res, null);
  } catch (e) {
    if (e.code === '23503') return fail(res, 400, 'Template is in use by offerings');
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
