const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ok, fail } = require('../helpers/response');

const USER_WITH_PERMS = `
  SELECT u.id, u.name, u.username, u.email,
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
  WHERE %WHERE%
  GROUP BY u.id, r.id
`;

function buildUserPayload(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: {
      id: row.role_id,
      name: row.role_name,
      permissions: row.permissions || [],
    },
  };
}

exports.login = async (req, res) => {
  try {
    const { loginCredential, password } = req.body;
    if (!loginCredential || !password) {
      return fail(res, 400, 'loginCredential and password are required');
    }

    const sql = `
      SELECT u.*, r.id AS role_id, r.name AS role_name,
             COALESCE(
               json_agg(json_build_object('key', p.key, 'label', p.label, 'group', p.grp))
               FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) AS permissions
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.username = $1 OR u.email = $1
      GROUP BY u.id, r.id
    `;
    const { rows } = await db.query(sql, [loginCredential]);
    if (!rows[0]) return fail(res, 401, 'Invalid credentials');

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return fail(res, 401, 'Invalid credentials');

    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return ok(res, { token, user: buildUserPayload(user) });
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.logout = (_req, res) => ok(res, null);

exports.me = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT u.id, u.name, u.username, u.email,
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
      WHERE u.id = $1
      GROUP BY u.id, r.id
    `, [req.user.id]);
    return ok(res, buildUserPayload(rows[0]));
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return fail(res, 400, 'current_password and new_password are required');
    }
    if (new_password.length < 8) {
      return fail(res, 400, 'new_password must be at least 8 characters');
    }

    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return fail(res, 400, 'Current password is incorrect');

    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    return ok(res, null);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
