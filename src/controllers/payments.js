const db = require('../config/db');
const { ok, fail } = require('../helpers/response');

exports.list = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'Offering not found');

    const { rows: payments } = await db.query(
      'SELECT * FROM payments WHERE offering_id = $1 ORDER BY promise_date ASC',
      [id]
    );
    return ok(res, payments);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.create = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, promise_date, actual_payment_date, note } = req.body;

    if (!amount || !promise_date) {
      return fail(res, 400, 'amount and promise_date are required');
    }

    const { rows: offeringRows } = await db.query('SELECT id FROM offerings WHERE id = $1', [id]);
    if (!offeringRows[0]) return fail(res, 404, 'Offering not found');

    const { rows } = await db.query(
      `INSERT INTO payments (offering_id, amount, currency, promise_date, actual_payment_date, note, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, amount, currency || 'IDR', promise_date, actual_payment_date || null, note || null, req.user.id]
    );
    return ok(res, rows[0]);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.update = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const { amount, currency, promise_date, actual_payment_date, note } = req.body;

    const { rows } = await db.query(
      'SELECT id FROM payments WHERE id = $1 AND offering_id = $2',
      [pid, id]
    );
    if (!rows[0]) return fail(res, 404, 'Payment not found');

    await db.query(
      `UPDATE payments SET
         amount = COALESCE($1, amount),
         currency = COALESCE($2, currency),
         promise_date = COALESCE($3, promise_date),
         actual_payment_date = $4,
         note = COALESCE($5, note)
       WHERE id = $6`,
      [amount ?? null, currency ?? null, promise_date ?? null, actual_payment_date ?? null, note ?? null, pid]
    );
    return ok(res, null);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.remove = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const { rowCount } = await db.query(
      'DELETE FROM payments WHERE id = $1 AND offering_id = $2',
      [pid, id]
    );
    if (!rowCount) return fail(res, 404, 'Payment not found');
    return ok(res, null);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
