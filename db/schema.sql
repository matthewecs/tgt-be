-- TGT Water Treatment — Database Schema
-- Run once on a fresh database: psql $DATABASE_URL -f db/schema.sql
-- Seeders: npm run db:seed (roles/permissions) && npm run db:seed:users

-- ── Roles & permissions ───────────────────────────────────────────────────────

CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL   -- 'admin' | 'owner' | 'worker'
);

CREATE TABLE permissions (
  id    SERIAL PRIMARY KEY,
  key   VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(200) NOT NULL,
  grp   VARCHAR(50)  NOT NULL
);

CREATE TABLE role_permissions (
  role_id       INT REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(200) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id       INT REFERENCES roles(id) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Customers ─────────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id           SERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  city         VARCHAR(100),
  contact_name VARCHAR(200) NOT NULL,
  phone        VARCHAR(50)  NOT NULL,
  email        VARCHAR(200),
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Offering templates ────────────────────────────────────────────────────────

CREATE TABLE offering_templates (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  created_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_items (
  id                    SERIAL PRIMARY KEY,
  template_id           INT REFERENCES offering_templates(id) ON DELETE CASCADE,
  item_name             VARCHAR(300) NOT NULL,
  price_range_min       NUMERIC(18,2),           -- CONFIDENTIAL: selling price guidance (lower bound)
  price_range_max       NUMERIC(18,2),           -- CONFIDENTIAL: selling price guidance (upper bound)
  actual_price          NUMERIC(18,2),           -- CONFIDENTIAL: buying / cost price
  actual_price_currency VARCHAR(10) DEFAULT 'IDR',
  quantity              INT NOT NULL DEFAULT 1,  -- minimum quantity hint for offerings
  is_mandatory          BOOLEAN DEFAULT TRUE,
  sort_order            INT DEFAULT 0
);

-- ── Offerings ─────────────────────────────────────────────────────────────────

CREATE TYPE offering_status AS ENUM (
  'draft',       -- created, not yet submitted; worker can edit
  'on_review',   -- submitted, awaiting owner/admin review; edit locked
  'need_revise', -- owner requested revision; worker can edit again
  'declined',    -- owner declined
  'approved',    -- owner approved; worker may generate PDF
  'offering',    -- PDF generated/sent; auto-set on first PDF download
  'on_going',    -- project in progress; manual advance by owner/admin
  'done'         -- project completed
);

CREATE TABLE offerings (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  customer_id INT REFERENCES customers(id) NOT NULL,
  template_id INT REFERENCES offering_templates(id),
  status      offering_status NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  reviewed_by INT REFERENCES users(id),
  created_by  INT REFERENCES users(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offering_items (
  id                    SERIAL PRIMARY KEY,
  offering_id           INT REFERENCES offerings(id) ON DELETE CASCADE,
  template_item_id      INT,                     -- snapshot reference only, no FK
  item_name             VARCHAR(300) NOT NULL,
  quantity              INT NOT NULL,
  template_min_quantity INT,                     -- copied from template at creation; FE validation hint
  price_range_min       NUMERIC(18,2),           -- CONFIDENTIAL: snapshotted from template
  price_range_max       NUMERIC(18,2),           -- CONFIDENTIAL: snapshotted from template
  selling_price         NUMERIC(18,2),           -- set by worker, always IDR
  buying_price          NUMERIC(18,2),           -- CONFIDENTIAL: snapshotted from template actual_price
  buying_currency       VARCHAR(10) DEFAULT 'IDR',
  is_mandatory          BOOLEAN DEFAULT TRUE,
  owner_comment         TEXT,
  sort_order            INT DEFAULT 0
);

CREATE TABLE offering_logs (
  id          SERIAL PRIMARY KEY,
  offering_id INT REFERENCES offerings(id) ON DELETE CASCADE,
  user_id     INT REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  details     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ──────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id                  SERIAL PRIMARY KEY,
  offering_id         INT REFERENCES offerings(id) ON DELETE CASCADE,
  amount              NUMERIC(18,2) NOT NULL,
  currency            VARCHAR(10) DEFAULT 'IDR',
  promise_date        DATE NOT NULL,
  actual_payment_date DATE,
  note                TEXT,
  created_by          INT REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
