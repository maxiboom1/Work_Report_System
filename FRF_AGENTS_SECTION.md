---

## Feature: Fault Registration Form (FRF) — v1.0

> Scope: fault creation (manager), fault management + event timeline (admin), PDF generation (later milestone).
> Email / SMTP delivery — deferred, out of current scope.

---

### Roles & Access

| Role | Permissions |
|---|---|
| Manager | Create new faults, view own faults |
| Admin | Full CRUD on all faults, add timeline events, generate PDFs |

---

### M1 — Database Schema

**`faults`**
- `id` INT IDENTITY PK
- `fault_ref` NVARCHAR(20) NOT NULL UNIQUE — human-readable, e.g. `FLT-2026-0042`
- `client_id` INT NULL FK → clients (NULL if custom)
- `client_custom` NVARCHAR(120) NULL
- `site_id` INT NULL FK → client_sites (NULL if custom)
- `site_custom` NVARCHAR(120) NULL
- `manufacturer_id` INT NULL FK → fault_manufacturers (NULL if custom)
- `manufacturer_custom` NVARCHAR(120) NULL
- `equipment_category_id` INT NULL FK → fault_equipment_categories (NULL if custom)
- `equipment_category_custom` NVARCHAR(120) NULL
- `equipment_subcategory_id` INT NULL FK → fault_equipment_subcategories (NULL if custom)
- `equipment_subcategory_custom` NVARCHAR(120) NULL
- `serial_number` NVARCHAR(80) NULL
- `manufacturer_ticket_id` NVARCHAR(80) NULL
- `fault_description` NVARCHAR(MAX) NULL
- `support_level` NVARCHAR(30) NOT NULL — enum: `layer2_support` | `under_support` | `no_support`
- `status` BIT NOT NULL DEFAULT 1 — 1 = open, 0 = closed
- `created_by` INT NOT NULL FK → employees
- `created_at` DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
- `updated_at` DATETIME2(0) NULL

**`fault_contacts`** (junction — many contacts per fault)
- `fault_id` INT NOT NULL FK → faults
- `contact_id` INT NULL FK → client_contacts (NULL if custom)
- `contact_name_custom` NVARCHAR(120) NULL
- `contact_email_custom` NVARCHAR(120) NULL
- `contact_phone_custom` NVARCHAR(40) NULL
- PK: (fault_id, contact_id) or (fault_id, contact_name_custom)

**`fault_events`**
- `id` INT IDENTITY PK
- `fault_id` INT NOT NULL FK → faults
- `event_text` NVARCHAR(MAX) NOT NULL
- `created_by` INT NOT NULL FK → employees
- `created_at` DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()

**`fault_attachments`**
- `id` INT IDENTITY PK
- `fault_id` INT NOT NULL FK → faults
- `original_name` NVARCHAR(255) NOT NULL
- `stored_name` NVARCHAR(255) NOT NULL — UUID-based filename on disk
- `mime_type` NVARCHAR(100) NOT NULL
- `file_size_bytes` INT NOT NULL
- `uploaded_by` INT NOT NULL FK → employees
- `uploaded_at` DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()

> Files stored on disk under `uploads/faults/:fault_id/`. Path prefix in `config.json`.
> Accepted types: images (jpg, png, webp), PDF. Max size per file: configurable (default 10MB).

---

### M2 — Backend API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/faults` | manager+ | Create fault |
| GET | `/api/faults` | manager+ | List faults (admin = all, manager = own) |
| GET | `/api/faults/:id` | manager+ | Full detail + events + attachments |
| PATCH | `/api/faults/:id/status` | admin | Toggle open / closed |
| POST | `/api/faults/:id/events` | admin | Add timeline event |
| POST | `/api/faults/:id/attachments` | manager+ | Upload file(s) to fault |
| GET | `/api/faults/:id/attachments/:fileId` | manager+ | Download/serve attachment |
| DELETE | `/api/faults/:id/attachments/:fileId` | admin | Delete attachment |
| GET | `/api/faults/:id/pdf` | admin | Generate and return PDF (later milestone) |

---

### M3 — FRF Creation Form (Manager UI)

**Cascading dropdowns — all support `+ Other` fallback:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Client | dropdown + other | ✅ | |
| Site | dropdown + other | ✅ | Filtered by selected client |
| Client contacts | multi-select + other | ✅ (name only) | Email / phone optional on custom |
| Manufacturer | dropdown + other | ✅ | If *other* → hide cat/subcat dropdowns, show free-text fields instead |
| Category | dropdown + other | ✅ | Hidden when manufacturer = *other* |
| Subcategory | dropdown + other | ✅ | Hidden when manufacturer = *other* |
| Support level | dropdown (fixed 3 options) | ✅ | See values below |
| Manufacturer ticket ID | text | ❌ | |
| Serial number | text | ❌ | |
| Fault description | textarea | ❌ | |
| Attachments | file upload (multi) | ❌ | Images + PDF, max 10MB each |

**Support level dropdown values:**

| Display label | Stored value |
|---|---|
| Under Layer-2 Support | `layer2_support` |
| Under Support | `under_support` |
| Not Under Support | `no_support` |

**On submit behavior:**
1. If any *other* field was used → insert new record into the relevant master table first, use returned ID as FK.
2. Insert fault row with `status = open`, `fault_ref` generated server-side.
3. Save first event automatically: `"Fault opened by <manager name>"` with creation timestamp.
4. Upload attachments if any were selected.

---

### M4 — Admin Fault Dashboard

- Faults list table with filters: status (open/closed), client, support level, date range
- Click fault → detail panel:
  - All fault fields (read-only summary)
  - Support level badge
  - Attachments list with download links, delete button per file, upload new files button
  - Chronological event timeline with author + timestamp per event
  - *Add event* button → inline text input form
  - Toggle open / closed status button
  - *Generate PDF* button (later milestone)

---

### M5 — PDF Generation (later milestone)

Deferred. Schema and API stubs can be included but implementation is out of current scope.

Document will include: company logo, fault ref + creation date, all fault fields, support level, contact list, event timeline with authors, attachment list (names only), current status.

---

### Technical Notes

- **`fault_ref` generation**: server-side on POST, format `FLT-YYYY-NNNN` (sequential per year, zero-padded to 4 digits).
- **"Other" insert order**: master table inserts must complete before the fault row insert (use a transaction).
- **File storage**: `multer` for multipart upload handling. Store under `uploads/faults/:fault_id/` with UUID filenames. Never expose the stored filename to the client — serve via the download API route.
- **Attachment security**: download route must verify the requesting user has access to that fault_id before serving the file.
- **Pagination**: faults list API must support `?page=` and `?limit=` from day one.

---
