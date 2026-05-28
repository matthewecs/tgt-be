# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start with nodemon (auto-reload)
npm start             # production start

npm run db:migrate    # run db/schema.sql on a fresh database
npm run db:seed       # run db/seed.sql (roles, permissions, role-permission assignments)
npm run db:seed:users # insert seed users via db/userSeed.js
npm run db:setup      # all three above in sequence
```

`db:schema` and `db:seed` use `db/run-sql.js` as a wrapper so they read `DATABASE_URL` from `.env` via dotenv before calling `psql`. Direct `psql $DATABASE_URL` in npm scripts does **not** read `.env`.

## Architecture

**Pattern:** flat route → controller. No service layer. Each route file mounts an Express router; each controller file exports async handler functions directly.

```
src/server.js              # mounts all routers, error handler
src/middleware/auth.js     # authenticate() + requirePermission(key) + hasPermission(user, key)
src/helpers/response.js    # ok(res, data) / fail(res, status, msg) — used everywhere
src/helpers/pdf.js         # pdfkit offering PDF generator
src/config/db.js           # pg Pool, exports { query, getClient }
src/routes/offerings.js    # also mounts payment sub-routes (/offerings/:id/payments/...)
```

**Auth flow:** `authenticate` middleware verifies the JWT, then re-fetches the user + role + permissions from the DB on every request and attaches it to `req.user`. `requirePermission(key)` is route-level middleware. `hasPermission(user, key)` is called inside controllers to conditionally shape responses (e.g. strip confidential fields).

**Confidential field stripping** is done in-controller, not in a middleware layer:
- `template:read_confidential` → controls `price_range_*` and `actual_price*` on template items
- `offering:read_confidential` → controls `buying_price`, `buying_currency`, and `total_capital` on offering items

**Multi-currency totals** are always objects keyed by currency string, never converted:
```js
{ "IDR": 45000000, "USD": 1200 }
```
Computed via `computeTotals(offeringId)` in `controllers/offerings.js` using GROUP BY currency SQL.

**Offering status machine:**
```
draft ──submit──▶ on_review ──approve──▶ approved ──1st PDF download──▶ offering ──▶ on_going ──▶ done
                      │
                 need_revise ◀──revision──┤
                 declined    ◀──reject────┘
```
- Edit allowed only in `draft` or `need_revise` (constant `EDITABLE_STATUSES`). Returns HTTP 409 otherwise.
- `submit` / `approve` / `reject` / `revision` each guard against wrong current status and return HTTP 400.
- `PATCH /offerings/:id/status` enforces sequential `offering → on_going → done` via `STATUS_NEXT` map. Returns HTTP 422 for any other transition.
- First PDF download (`status = 'approved'`) auto-advances to `'offering'` and logs `pdf_generated`. Subsequent downloads do not change status.
- PDF access requires status in `PDF_ALLOWED_STATUSES = ['approved', 'offering', 'on_going', 'done']`.

**Transactions:** any mutation touching multiple tables uses `db.getClient()` with explicit `BEGIN/COMMIT/ROLLBACK`. All offering mutations must also call `addLog(client, offeringId, userId, action, details)` inside the same transaction.

**Numeric fields from frontend:** The FE sends empty strings (`""`) for blank price fields. Use `num(v)` (defined at top of `controllers/offerings.js`) before passing any price value to a query parameter. `??` alone does not catch `""`.

## Database

Schema is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`). Safe to re-run `db:setup`.

Roles: `admin` (all permissions), `owner` (read-all + approve/reject/comment), `worker` (own offerings only, submit, PDF after approval).

Dev seed users: `admin/admin123`, `owner/owner123`, `worker/worker123`.
