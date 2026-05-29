const db = require('../config/db');
const { ok, fail } = require('../helpers/response');
const { hasPermission } = require('../middleware/auth');

exports.list = async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM customers ORDER BY id DESC'
    );
    return ok(res, rows);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!rows[0]) return fail(res, 404, 'Customer not found');
    return ok(res, rows[0]);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.create = async (req, res) => {
  try {
    const { company_name, city, contact_name, phone, email } = req.body;
    if (!company_name || !contact_name || !phone) {
      return fail(res, 400, 'company_name, contact_name, and phone are required');
    }
    const { rows } = await db.query(
      `INSERT INTO customers (company_name, city, contact_name, phone, email, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [company_name, city || null, contact_name, phone, email || null, req.user.id]
    );
    return ok(res, rows[0]);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.update = async (req, res) => {
  try {
    const { company_name, city, contact_name, phone, email } = req.body;
    const { id } = req.params;
    const { rows: existing } = await db.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (!existing[0]) return fail(res, 404, 'Customer not found');

    await db.query(
      `UPDATE customers SET
         company_name = COALESCE($1, company_name),
         city = COALESCE($2, city),
         contact_name = COALESCE($3, contact_name),
         phone = COALESCE($4, phone),
         email = COALESCE($5, email)
       WHERE id = $6`,
      [company_name, city, contact_name, phone, email, id]
    );
    return ok(res, null);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.remove = async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    if (!rowCount) return fail(res, 404, 'Customer not found');
    return ok(res, null);
  } catch (e) {
    if (e.code === '23503') return fail(res, 400, 'Customer has associated data');
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getOfferings = async (req, res) => {
  try {
    const canReadAll = hasPermission(req.user, 'offering:read_all');
    const canReadConfidential = hasPermission(req.user, 'offering:read_confidential');

    const { rows: customer } = await db.query('SELECT id FROM customers WHERE id = $1', [req.params.id]);
    if (!customer[0]) return fail(res, 404, 'Customer not found');

    let sql, params;
    if (canReadAll) {
      sql = `
        SELECT o.*, u.name AS created_by_name
        FROM offerings o
        LEFT JOIN users u ON u.id = o.created_by
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC
      `;
      params = [req.params.id];
    } else {
      sql = `
        SELECT o.id, o.title, o.status, o.created_at, u.name AS created_by_name
        FROM offerings o
        LEFT JOIN users u ON u.id = o.created_by
        WHERE o.customer_id = $1 AND o.created_by = $2
        ORDER BY o.created_at DESC
      `;
      params = [req.params.id, req.user.id];
    }

    const { rows: offerings } = await db.query(sql, params);

    if (canReadAll && canReadConfidential) {
      for (const o of offerings) {
        const [capRows, revRows] = await Promise.all([
          db.query(
            `SELECT buying_currency AS currency, SUM(quantity * buying_price) AS total
             FROM offering_items WHERE offering_id = $1 GROUP BY buying_currency`,
            [o.id]
          ),
          db.query(
            `SELECT selling_currency AS currency, SUM(quantity * selling_price) AS total
             FROM offering_items WHERE offering_id = $1 GROUP BY selling_currency`,
            [o.id]
          ),
        ]);
        o.total_capital = Object.fromEntries(capRows.rows.map(r => [r.currency, Number(r.total)]));
        o.total_revenue = Object.fromEntries(revRows.rows.map(r => [r.currency, Number(r.total)]));
      }
    }

    return ok(res, offerings);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
