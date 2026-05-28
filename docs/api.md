# TGT Backend — API Reference

Base URL: `http://localhost:4000`

## Conventions

**All responses** use this envelope:
```json
{ "success": true,  "data": <payload> }
{ "success": false, "message": "Human-readable error" }
```

**Auth header** (all protected routes):
```
Authorization: Bearer <token>
```

**HTTP status codes used:**
| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Bad request / wrong state for action |
| 401 | Missing or invalid token |
| 403 | Valid token, insufficient permission |
| 404 | Resource not found |
| 409 | Conflict (e.g. edit locked) |
| 422 | Validation failure (e.g. quantity too low, invalid status transition) |
| 500 | Server error |

---

## Auth — `/user`

### `POST /user/login`
No auth required.

**Request**
```json
{ "loginCredential": "username_or_email", "password": "string" }
```

**Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "name": "Administrator",
      "username": "admin",
      "email": "admin@tgt.co.id",
      "role": {
        "id": 1,
        "name": "admin",
        "permissions": [
          { "key": "offering:create", "label": "Create Offering", "group": "offering" }
        ]
      }
    }
  }
}
```

### `POST /user/logout`
Returns `{ "success": true, "data": null }`.

### `GET /user/me`
Returns the current user in the same shape as the login `user` object.

### `PUT /user/me/password`
```json
{ "current_password": "old", "new_password": "min_8_chars" }
```

---

## Users — `/users`
> Requires `user:manage`

### `GET /users`
Returns all users with role + permissions. No `password_hash`.

### `POST /users`
```json
{ "name": "string", "username": "string", "email": "string?", "role_id": 2, "password": "string" }
```

### `GET /users/:id`

### `PUT /users/:id`
All fields optional. `password` only updated if non-empty.

### `DELETE /users/:id`
Blocked for self. Returns 400 if user has associated data.

---

## Roles & Permissions

### `GET /roles`
Returns all roles with their `permissions[]`. No special permission required beyond being authenticated.

### `GET /permissions`
Returns all permission definitions.

### `PUT /roles/:id/permissions`
> Requires `role:manage`

Replaces the full permission set for a role.
```json
{ "permissions": ["template:read", "offering:create"] }
```
Returns the updated role with new permissions.

---

## Customers — `/customers`
> All routes require `customer:read`

### `GET /customers`
All customers.

### `POST /customers`
> Requires `customer:create`
```json
{
  "company_name": "PT. Aqua Murni",
  "city": "Jakarta",
  "contact_name": "Budi Santoso",
  "phone": "+62 812 3456 7890",
  "email": "budi@aquamurni.co.id"
}
```

### `GET /customers/:id`

### `PUT /customers/:id`
> Requires `customer:update`

### `DELETE /customers/:id`
> Requires `customer:delete`

### `GET /customers/:id/offerings`
Role-filtered:
- `offering:read_all` (owner/admin) → full offering objects with `total_capital` + `total_revenue`
- `offering:read_own` (worker) → `{ id, title, status, created_at, created_by_name }` only

---

## Offering Templates — `/offering-templates`
> All routes require `template:read`

**Confidential fields** (`price_range_min`, `price_range_max`, `actual_price`, `actual_price_currency`) are stripped from items for users without `template:read_confidential`.

### `GET /offering-templates`
All templates with `items[]`.

### `POST /offering-templates`
> Requires `template:create`
```json
{
  "title": "Water Treatment Package A",
  "description": "Standard 50 m³/day system",
  "items": [
    {
      "item_name": "Filter Housing",
      "price_range_min": 5000000,
      "price_range_max": 8000000,
      "actual_price": 4200000,
      "actual_price_currency": "IDR",
      "quantity": 2,
      "is_mandatory": true,
      "sort_order": 0
    }
  ]
}
```
Note: `price_range_currency` no longer exists — selling is always IDR.

### `GET /offering-templates/:id`

### `PUT /offering-templates/:id`
> Requires `template:update`

Replaces the full items array (delete all + re-insert).

### `DELETE /offering-templates/:id`
> Requires `template:delete`

---

## Offerings — `/offerings`

### `GET /offerings`
Role-filtered:
- `offering:read_all` → all offerings
- `offering:read_own` → only own offerings

Each item includes `customer { id, company_name }` and `created_by_name`.
Users with `offering:read_confidential` also receive `total_capital` + `total_revenue`.

### `POST /offerings`
> Requires `offering:create`

Creates offering with `status = 'draft'`. Buying price is snapshotted from `template_items.actual_price` when `buying_price` is empty.

```json
{
  "title": "Water Treatment System Q1",
  "customer_id": 1,
  "template_id": 2,
  "items": [
    {
      "template_item_id": 10,
      "item_name": "Filter Housing",
      "quantity": 4,
      "selling_price": 9500000,
      "buying_price": "",
      "buying_currency": "IDR",
      "is_mandatory": true
    }
  ]
}
```

Returns `{ "id": 5 }`.

### `GET /offerings/:id`
Full detail. Includes:
- `customer` (all fields)
- `items[]` — confidential fields (`buying_price`, `buying_currency`, `price_range_min`, `price_range_max`) stripped for users without `offering:read_confidential`
- `total_revenue: { "IDR": n }` — always included
- `total_capital: { <currency>: n }` — only for `offering:read_confidential`
- `logs[]` — full audit trail, ordered ASC

```json
{
  "id": 5,
  "title": "Water Treatment System Q1",
  "status": "draft",
  "approved_at": null,
  "reviewed_by": null,
  "created_by": 3,
  "created_by_name": "Adi Kurniawan",
  "created_at": "2025-02-01T08:00:00Z",
  "updated_at": "2025-02-01T08:00:00Z",
  "customer": { "id": 1, "company_name": "PT. Aqua Murni", "city": "Jakarta", "contact_name": "Budi", "phone": "+62...", "email": "..." },
  "template_id": 2,
  "items": [
    {
      "id": 22,
      "template_item_id": 10,
      "item_name": "Filter Housing",
      "quantity": 4,
      "template_min_quantity": 2,
      "price_range_min": 5000000,
      "price_range_max": 8000000,
      "selling_price": 9500000,
      "buying_price": 4200000,
      "buying_currency": "IDR",
      "is_mandatory": true,
      "owner_comment": null,
      "sort_order": 0
    }
  ],
  "total_revenue": { "IDR": 38000000 },
  "total_capital": { "IDR": 16800000 },
  "logs": [
    { "id": 1, "action": "created", "user_id": 3, "user_name": "Adi Kurniawan", "details": null, "created_at": "..." }
  ]
}
```

### `PUT /offerings/:id`
> Requires `offering:update` — only when `status IN ('draft', 'need_revise')`, else **409**

```json
{
  "items": [
    { "id": 22, "quantity": 5, "selling_price": 9800000 },
    { "item_name": "Extra UV Filter", "quantity": 1, "selling_price": 2000000, "buying_price": 1200000, "buying_currency": "IDR", "is_mandatory": false }
  ]
}
```
- Items with `id`: update in place
- Items without `id`: insert as new
- Items in DB but absent from body: deleted

Logs `updated`.

---

## Offering Workflow

### `POST /offerings/:id/submit`
> Requires `offering:submit`

Valid from: `draft`, `need_revise` → sets `status = 'on_review'`.
Logs `submitted`.

### `POST /offerings/:id/approve`
> Requires `offering:approve`

Valid from: `on_review` → sets `status = 'approved'`, records `approved_at` + `reviewed_by`.
Logs `approved`.

### `POST /offerings/:id/reject`
> Requires `offering:reject`

Valid from: `on_review` → sets `status = 'declined'`.
```json
{ "reason": "string" }
```
Logs `declined` with reason.

### `POST /offerings/:id/revision`
> Requires `offering:reject`

Valid from: `on_review` → sets `status = 'need_revise'`. Worker can edit and resubmit.
```json
{ "comment": "string" }
```
Logs `revision_requested` with comment.

### `PATCH /offerings/:id/status`
> Requires `offering:status_update`

Manual sequential advance by owner/admin only:
- `on_going` when current is `offering`
- `done` when current is `on_going`

Any other transition returns **422**.
```json
{ "status": "on_going" }
```
Logs `status_changed` with `"offering → on_going"`.

### `POST /offerings/:id/item-comment`
> Requires `offering:comment`

Sets/overwrites `owner_comment` on a single item. Visible to all users who can read the offering.
```json
{ "item_id": 22, "comment": "Please confirm supplier availability." }
```
Logs `item_commented`.

### `GET /offerings/:id/pdf`
> Requires `offering:pdf`

Available when `status IN ('approved', 'offering', 'on_going', 'done')` — **403** otherwise.

**First download** (`status = 'approved'`): auto-advances to `'offering'` and logs `pdf_generated`. Re-downloads do not change status.

Response headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="offering-<id>.pdf"
Access-Control-Expose-Headers: Content-Disposition
```

PDF contains: company header, offering title/date/status, customer info, items table (name, qty, selling price IDR, mandatory flag), total revenue.

### `GET /offerings/:id/logs`
Audit log ordered `created_at ASC`. Also included in `GET /offerings/:id` response.

```json
[
  { "id": 1, "action": "created",   "user_id": 3, "user_name": "Adi", "details": null,            "created_at": "..." },
  { "id": 2, "action": "submitted", "user_id": 3, "user_name": "Adi", "details": null,            "created_at": "..." },
  { "id": 3, "action": "approved",  "user_id": 2, "user_name": "Owner", "details": null,          "created_at": "..." },
  { "id": 4, "action": "status_changed", "user_id": 2, "user_name": "Owner", "details": "offering → on_going", "created_at": "..." }
]
```

**Log action values:**
| action | triggered by |
|--------|-------------|
| `created` | POST /offerings |
| `updated` | PUT /offerings/:id |
| `submitted` | POST /offerings/:id/submit |
| `approved` | POST /offerings/:id/approve |
| `declined` | POST /offerings/:id/reject |
| `revision_requested` | POST /offerings/:id/revision |
| `pdf_generated` | GET /offerings/:id/pdf (first download only) |
| `status_changed` | PATCH /offerings/:id/status |
| `item_commented` | POST /offerings/:id/item-comment |

---

## Payments — `/offerings/:id/payments`
> All routes require `payment:manage`

### `GET /offerings/:id/payments`

### `POST /offerings/:id/payments`
```json
{
  "amount": 20000000,
  "currency": "IDR",
  "promise_date": "2025-03-01",
  "actual_payment_date": null,
  "note": "DP 50%"
}
```

### `PUT /offerings/:id/payments/:pid`
All fields optional.

### `DELETE /offerings/:id/payments/:pid`

---

## Permissions Reference

| Key | Label | Group | Admin | Owner | Worker |
|-----|-------|-------|:-----:|:-----:|:------:|
| `template:create` | Create Template | template | ✓ | | |
| `template:read` | View Templates | template | ✓ | ✓ | ✓ |
| `template:read_confidential` | View Confidential Prices | template | ✓ | ✓ | |
| `template:update` | Edit Template | template | ✓ | | |
| `template:delete` | Delete Template | template | ✓ | | |
| `offering:create` | Create Offering | offering | ✓ | | ✓ |
| `offering:read_own` | View Own Offerings | offering | ✓ | | ✓ |
| `offering:read_all` | View All Offerings | offering | ✓ | ✓ | |
| `offering:read_confidential` | View Confidential Prices | offering | ✓ | ✓ | |
| `offering:update` | Edit Offering | offering | ✓ | | ✓ |
| `offering:submit` | Submit for Review | offering | ✓ | | ✓ |
| `offering:approve` | Approve Offering | offering | ✓ | ✓ | |
| `offering:reject` | Reject / Request Revision | offering | ✓ | ✓ | |
| `offering:comment` | Comment on Items | offering | ✓ | ✓ | |
| `offering:pdf` | Generate PDF | offering | ✓ | | ✓ |
| `offering:status_update` | Update Status | offering | ✓ | ✓ | |
| `customer:create` | Create Customer | customer | ✓ | ✓ | ✓ |
| `customer:read` | View Customers | customer | ✓ | ✓ | ✓ |
| `customer:update` | Edit Customer | customer | ✓ | | |
| `customer:delete` | Delete Customer | customer | ✓ | | |
| `payment:manage` | Manage Payments | payment | ✓ | ✓ | ✓ |
| `user:manage` | Manage Users | admin | ✓ | | |
| `role:manage` | Manage Roles & Permissions | admin | ✓ | | |
