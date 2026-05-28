const jwt = require('jsonwebtoken');
const db = require('../config/db');

const USER_QUERY = `
  SELECT u.id, u.name, u.username, u.email, u.role_id,
         r.id AS r_id, r.name AS role_name,
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
`;

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(USER_QUERY, [payload.sub]);
    if (!rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requirePermission(key) {
  return (req, res, next) => {
    const has = req.user.permissions.some(p => p.key === key);
    if (!has) {
      return res.status(403).json({ success: false, message: `Permission required: ${key}` });
    }
    next();
  };
}

function hasPermission(user, key) {
  return user.permissions.some(p => p.key === key);
}

module.exports = { authenticate, requirePermission, hasPermission };
