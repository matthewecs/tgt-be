const bcrypt = require('bcrypt');
const db = require('../config/db');
const { ok, fail } = require('../helpers/response');

const USER_LIST_SQL = `
  SELECT u.id, u.name, u.username, u.email, u.created_at,
         r.id AS role_id, r.name AS role_name,
         COALESCE(
           json_agg(json_build_object('key', p.key, 'label', p.label, 'group', p.grp))
           FILTER (WHERE p.id IS NOT NULL),
           '[]'
         ) AS permissions
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
`;

function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    created_at: row.created_at,
    role: { id: row.role_id, name: row.role_name, permissions: row.permissions || [] },
  };
}

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query(USER_LIST_SQL + ' GROUP BY u.id, r.id ORDER BY u.id');
    return ok(res, rows.map(formatUser));
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { rows } = await db.query(
      USER_LIST_SQL + ' WHERE u.id = $1 GROUP BY u.id, r.id',
      [req.params.id]
    );
    if (!rows[0]) return fail(res, 404, 'User not found');
    return ok(res, formatUser(rows[0]));
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, username, email, role_id, password } = req.body;
    if (!name || !username || !role_id || !password) {
      return fail(res, 400, 'name, username, role_id, and password are required');
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (name, username, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, username, email || null, hash, role_id]
    );
    return ok(res, { id: rows[0].id });
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'Username or email already in use');
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.update = async (req, res) => {
  try {
    const { name, username, email, role_id, password } = req.body;
    const { id } = req.params;

    const { rows } = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (!rows[0]) return fail(res, 404, 'User not found');

    const updates = [];
    const values = [];
    let idx = 1;

    if (name)     { updates.push(`name = $${idx++}`);     values.push(name); }
    if (username) { updates.push(`username = $${idx++}`); values.push(username); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); values.push(email || null); }
    if (role_id)  { updates.push(`role_id = $${idx++}`);  values.push(role_id); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (!updates.length) return fail(res, 400, 'No fields to update');

    values.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, values);
    return ok(res, null);
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'Username or email already in use');
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return fail(res, 400, 'Cannot delete your own account');
    }
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) return fail(res, 404, 'User not found');
    return ok(res, null);
  } catch (e) {
    if (e.code === '23503') {
      return fail(res, 400, 'User has associated data and cannot be deleted');
    }
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
