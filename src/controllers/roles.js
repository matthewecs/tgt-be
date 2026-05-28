const db = require('../config/db');
const { ok, fail } = require('../helpers/response');

exports.listRoles = async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT r.id, r.name,
             COALESCE(
               json_agg(json_build_object('key', p.key, 'label', p.label, 'group', p.grp))
               FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      GROUP BY r.id
      ORDER BY r.id
    `);
    return ok(res, rows);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.listPermissions = async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT id, key, label, grp AS "group" FROM permissions ORDER BY grp, key');
    return ok(res, rows);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};

exports.setRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return fail(res, 400, 'permissions must be an array of permission keys');
    }

    const { rows: roleRows } = await db.query('SELECT id FROM roles WHERE id = $1', [id]);
    if (!roleRows[0]) return fail(res, 404, 'Role not found');

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

      if (permissions.length > 0) {
        const { rows: permRows } = await client.query(
          'SELECT id FROM permissions WHERE key = ANY($1)',
          [permissions]
        );
        for (const perm of permRows) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, perm.id]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await db.query(`
      SELECT r.id, r.name,
             COALESCE(
               json_agg(json_build_object('key', p.key, 'label', p.label, 'group', p.grp))
               FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE r.id = $1
      GROUP BY r.id
    `, [id]);
    return ok(res, rows[0]);
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'Server error');
  }
};
