# TGT Backend Service

Node.js REST API for the TGT Water Treatment internal dashboard. Runs on port `4000`.

---

## Prerequisites

- Node.js v18+
- PostgreSQL 14+

---

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd tgt-be
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
DATABASE_URL=postgres://your_user:your_password@localhost:5432/tgt_db
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

---

## Database Setup

### Install PostgreSQL (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PostgreSQL (macOS with Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Create database and user

```bash
sudo -u postgres psql
```

Inside psql:

```sql
CREATE USER tgt_user WITH PASSWORD 'your_password';
CREATE DATABASE tgt_db OWNER tgt_user;
GRANT ALL PRIVILEGES ON DATABASE tgt_db TO tgt_user;
\q
```

Update your `.env` `DATABASE_URL` accordingly:
```
DATABASE_URL=postgres://tgt_user:your_password@localhost:5432/tgt_db
```

### Run migration (create all tables)

```bash
npm run db:migrate
```

### Seed roles, permissions, and default users

```bash
npm run db:seed       # roles, permissions, role-permission assignments
npm run db:seed:users # default admin / owner / worker users
```

Or run all three steps at once:

```bash
npm run db:setup
```

#### Default seed users

| Username | Password   | Role   |
|----------|------------|--------|
| admin    | admin123   | admin  |
| owner    | owner123   | owner  |
| worker   | worker123  | worker |

> **Change these passwords immediately in production.**

---

## Running the Service

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The service will be available at `http://localhost:4000`.

---

## API Overview

All responses follow this envelope:

```json
{ "success": true, "data": <payload> }
{ "success": false, "message": "Error description" }
```

All protected endpoints require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/user/login` | Login with username or email |
| POST | `/user/logout` | Logout (stateless) |
| GET | `/user/me` | Get current user |
| PUT | `/user/me/password` | Change own password |

### Users (requires `user:manage`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Roles & Permissions (requires `role:manage`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/roles` | List roles with permissions |
| GET | `/permissions` | List all permissions |
| PUT | `/roles/:id/permissions` | Replace role permissions |

### Customers (requires `customer:read`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/customers/:id/offerings` | Get customer's offerings (role-filtered) |

### Offering Templates (requires `template:read`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/offering-templates` | List templates |
| POST | `/offering-templates` | Create template |
| GET | `/offering-templates/:id` | Get template |
| PUT | `/offering-templates/:id` | Update template |
| DELETE | `/offering-templates/:id` | Delete template |

### Offerings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/offerings` | List offerings (role-filtered) |
| POST | `/offerings` | Create offering |
| GET | `/offerings/:id` | Get offering detail |
| PUT | `/offerings/:id` | Update offering items |
| POST | `/offerings/:id/submit` | Submit for review |
| POST | `/offerings/:id/approve` | Approve offering |
| POST | `/offerings/:id/reject` | Reject offering |
| POST | `/offerings/:id/revision` | Request revision |
| PATCH | `/offerings/:id/status` | Update status |
| POST | `/offerings/:id/item-comment` | Comment on item |
| GET | `/offerings/:id/pdf` | Download PDF |
| GET | `/offerings/:id/logs` | Get audit log |

### Payments (requires `payment:manage`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/offerings/:id/payments` | List payments |
| POST | `/offerings/:id/payments` | Create payment |
| PUT | `/offerings/:id/payments/:pid` | Update payment |
| DELETE | `/offerings/:id/payments/:pid` | Delete payment |

---

## Project Structure

```
tgt-be/
├── db/
│   ├── schema.sql          # Table definitions
│   ├── seed.sql            # Roles, permissions, role-permission assignments
│   └── userSeed.js         # Default user seeder (Node.js script)
├── src/
│   ├── server.js           # Express app entry point
│   ├── config/
│   │   └── db.js           # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js         # JWT authentication & permission middleware
│   ├── helpers/
│   │   ├── response.js     # ok() / fail() helpers
│   │   └── pdf.js          # PDF generation (pdfkit)
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── roles.js
│   │   ├── customers.js
│   │   ├── templates.js
│   │   ├── offerings.js
│   │   └── payments.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── roles.js
│       ├── permissions.js
│       ├── customers.js
│       ├── templates.js
│       └── offerings.js    # Includes payment sub-routes
├── .env.example
├── package.json
└── README.md
```
