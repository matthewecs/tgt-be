# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start with nodemon (auto-reload)
npm start             # production start

npm run db:migrate    # create all tables on a fresh database (db/schema.sql)
npm run db:seed       # insert roles, permissions, role-permission assignments (db/seed.sql)
npm run db:seed:users # insert default users via db/userSeed.js
npm run db:setup      # all three above in sequence
```

`db:migrate` and `db:seed` go through `db/run-sql.js` which reads `DATABASE_URL` from `.env` via dotenv before invoking `psql`. Direct shell `psql $DATABASE_URL` does **not** read `.env`.

## Architecture

**Pattern:** route file → controller function. No service layer. Each route file mounts an Express router and wires permission middleware; each controller exports plain async handlers.

```
src/server.js              # Express entry — mounts all routers, 404/500 handlers
src/config/db.js           # pg Pool; exports { query, getClient }
src/middleware/auth.js     # authenticate(), requirePermission(key), hasPermission(user, key)
src/helpers/response.js    # ok(res, data) / fail(res, status, msg)
src/helpers/pdf.js         # pdfkit PDF renderer for offerings
src/routes/offerings.js    # also owns /offerings/:id/payments/* sub-routes
```

**Auth:** `authenticate` verifies JWT, re-fetches user + role + full permissions array from DB on every request → `req.user`. `requirePermission(key)` is Express middleware used on routes. `hasPermission(user, key)` is used inside controllers to shape responses (e.g. strip confidential fields, filter owned-only rows).

**Confidential field stripping** happens inside controllers, never in middleware:
- `template:read_confidential` — strips `price_range_min`, `price_range_max`, `price_range_currency`, `actual_price`, `actual_price_currency` from template items
- `offering:read_confidential` — strips `buying_price`, `buying_currency` from offering items; omits `total_capital`

**Currency:** full multi-currency. `offering_items` has `selling_price` + `selling_currency` and `buying_price` + `buying_currency`. `template_items` has `price_range_currency` and `actual_price_currency`. `computeTotals()` groups by currency: `{ total_revenue: { IDR: n }, total_capital: { IDR: n, USD: n } }`.

**Offering status machine:**
```
draft ──submit──▶ on_review ──approve──▶ approved ──1st PDF──▶ offering ──▶ on_going ──▶ done
                      │
                 need_revise ◀──revision──┤
                 declined    ◀──reject────┘
```
- `EDITABLE_STATUSES = ['draft', 'need_revise']` — PUT returns 409 for any other status
- Each workflow action (submit/approve/reject/revision) validates current status, returns 400 if wrong
- `PATCH /offerings/:id/status` enforces `STATUS_NEXT = { offering→on_going, on_going→done }`, returns 422 otherwise
- First PDF download when `status = 'approved'` auto-advances to `'offering'` and logs `pdf_generated`
- `PDF_ALLOWED_STATUSES = ['approved', 'offering', 'on_going', 'done']`

**Offering logs:** every mutation calls `addLog(client, offeringId, userId, action, details)` inside the same DB transaction. `GET /offerings/:id` includes `logs[]` in the response. `GET /offerings/:id/logs` is a standalone endpoint.

**Transactions:** any write touching multiple tables uses `db.getClient()` with `BEGIN / COMMIT / ROLLBACK`. Always release the client in `finally`.

**Template → Offering snapshot:** when creating an offering, the controller queries `template_items` for `quantity`, `actual_price`, `actual_price_currency` and copies them into the offering item row as `template_min_quantity` and `buying_price`/`buying_currency`. `template_item_id` is stored as a plain integer (no FK) so templates can be freely edited/deleted after the snapshot.

**`num(v)` helper:** FE sends `""` for empty price fields. `num(v)` converts `""` / `undefined` → `null` before any value reaches a NUMERIC query param. `??` alone does not catch empty strings.

## Database

Single migration file: `db/schema.sql`. Drop DB and re-run `npm run db:setup` for a clean state.

Seed users (dev): `admin / admin123`, `owner / owner123`, `worker / worker123`.
