-- TGT Backend Database Schema

-- Users & Auth
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id    SERIAL PRIMARY KEY,
  key   VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(200) NOT NULL,
  grp   VARCHAR(50)  NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(200) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id       INT REFERENCES roles(id) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id           SERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  city         VARCHAR(100),
  contact_name VARCHAR(200) NOT NULL,
  phone        VARCHAR(50)  NOT NULL,
  email        VARCHAR(200),
  created_by   INT REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Offering Templates
CREATE TABLE IF NOT EXISTS offering_templates (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  created_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_items (
  id                    SERIAL PRIMARY KEY,
  template_id           INT REFERENCES offering_templates(id) ON DELETE CASCADE,
  item_name             VARCHAR(300) NOT NULL,
  price_range_min       NUMERIC(18,2),
  price_range_max       NUMERIC(18,2),
  price_range_currency  VARCHAR(10) DEFAULT 'IDR',
  actual_price          NUMERIC(18,2),
  actual_price_currency VARCHAR(10) DEFAULT 'IDR',
  quantity              INT NOT NULL DEFAULT 1,
  is_mandatory          BOOLEAN DEFAULT TRUE,
  sort_order            INT DEFAULT 0
);

-- Offerings
DO $$ BEGIN
  CREATE TYPE offering_status AS ENUM ('offering','deal','on_planning','on_going','done');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS offerings (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  customer_id INT REFERENCES customers(id) NOT NULL,
  template_id INT REFERENCES offering_templates(id),
  status      offering_status DEFAULT 'offering',
  submitted_at TIMESTAMPTZ,
  approved_at  TIMESTAMPTZ,
  reviewed_by  INT REFERENCES users(id),
  created_by   INT REFERENCES users(id) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offering_items (
  id                    SERIAL PRIMARY KEY,
  offering_id           INT REFERENCES offerings(id) ON DELETE CASCADE,
  template_item_id      INT REFERENCES template_items(id),
  item_name             VARCHAR(300) NOT NULL,
  quantity              INT NOT NULL,
  template_min_quantity INT,
  selling_price         NUMERIC(18,2),
  selling_currency      VARCHAR(10) DEFAULT 'IDR',
  buying_price          NUMERIC(18,2),
  buying_currency       VARCHAR(10) DEFAULT 'IDR',
  is_mandatory          BOOLEAN DEFAULT TRUE,
  owner_comment         TEXT,
  sort_order            INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS offering_logs (
  id          SERIAL PRIMARY KEY,
  offering_id INT REFERENCES offerings(id) ON DELETE CASCADE,
  user_id     INT REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  details     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
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
