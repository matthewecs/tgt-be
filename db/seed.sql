-- Roles
INSERT INTO roles (name) VALUES ('admin'), ('owner'), ('worker')
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO permissions (key, label, grp) VALUES
  ('template:create',            'Create Template',             'template'),
  ('template:read',              'View Templates',              'template'),
  ('template:read_confidential', 'View Confidential Prices',    'template'),
  ('template:update',            'Edit Template',               'template'),
  ('template:delete',            'Delete Template',             'template'),
  ('offering:create',            'Create Offering',             'offering'),
  ('offering:read_own',          'View Own Offerings',          'offering'),
  ('offering:read_all',          'View All Offerings',          'offering'),
  ('offering:read_confidential', 'View Confidential Prices',    'offering'),
  ('offering:update',            'Edit Offering',               'offering'),
  ('offering:submit',            'Submit Offering for Review',  'offering'),
  ('offering:approve',           'Approve Offering',            'offering'),
  ('offering:reject',            'Reject / Request Revision',   'offering'),
  ('offering:comment',           'Comment on Items',            'offering'),
  ('offering:pdf',               'Generate PDF',                'offering'),
  ('offering:status_update',     'Update Offering Status',      'offering'),
  ('customer:create',            'Create Customer',             'customer'),
  ('customer:read',              'View Customers',              'customer'),
  ('customer:update',            'Edit Customer',               'customer'),
  ('customer:delete',            'Delete Customer',             'customer'),
  ('payment:manage',             'Manage Payments',             'payment'),
  ('user:manage',                'Manage Users',                'admin'),
  ('role:manage',                'Manage Roles & Permissions',  'admin')
ON CONFLICT (key) DO NOTHING;

-- Admin gets everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Owner permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.key IN (
  'template:read', 'template:read_confidential',
  'offering:read_all', 'offering:read_confidential',
  'offering:approve', 'offering:reject', 'offering:comment', 'offering:status_update',
  'customer:create', 'customer:read',
  'payment:manage'
) WHERE r.name = 'owner'
ON CONFLICT DO NOTHING;

-- Worker permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.key IN (
  'template:read',
  'offering:create', 'offering:read_own', 'offering:update',
  'offering:submit', 'offering:pdf',
  'customer:create', 'customer:read',
  'payment:manage'
) WHERE r.name = 'worker'
ON CONFLICT DO NOTHING;
