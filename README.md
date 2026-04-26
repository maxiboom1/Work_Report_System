# Employee Work Report System

**Version:** v1.1.16

Employee Work Report System is an internal full-stack web application that allows employees to report daily work hours per project, while giving administrators a dashboard for employee/project management and reporting.

The system is intentionally simple, predictable, and fast to operate in a company LAN environment.

---

## Roles

### Employee
- Login with personal credentials
- Create / edit / delete their own work entries
- Multiple entries per day (e.g. half day project A + half day project B)
- Mobile-friendly worker UI with 2 tabs:
  - Register day (add a new entry)
  - View reports (monthly entries)
- Worker screens must remain responsive because employees mostly enter reports from mobile phones.
- Employees marked as managers can open manager-only tools:
  - Generate selected workers' name/passport/car details for client parking access.
  - Register external contractor work by project, contractor name, optional start/end time, service description, and optional cost.
  - Submit a new Fault Registration Form (FRF) for admin follow-up.

### Admin
- CRUD Employees
- CRUD Projects
- CRUD fault client data:
  - Clients
  - Client sites
  - Client contact managers
- CRUD fault equipment hierarchy:
  - Manufacturers
  - Equipment/model categories
  - Component/area subcategories
- Faults:
  - Review manager-submitted FRFs in a flat fault table
  - Filter by status, client, manufacturer, support level, and date range
  - Open a dedicated fault detail view
  - Add fault timeline events and close / reopen a fault
- Statistics:
  - Employee monthly report
  - Project monthly report (days & hours per employee + total cost)
  - External contractor report with editable service cost
- Admin screens are intended for desktop/workstation use and are not a mobile UI target.

v1.1.16 improvements:
- Polished the opener/login screen with a cleaner logo-first layout, updated color palette, focused form styling, and restrained entrance motion.
- Added a left-to-right company logo reveal with reduced-motion support.
- The new opener style language is planned to be applied across the frontend application, including color schemes, spacing, and control styling.

v1.1.15 improvements:
- Fixed the fault detail treatment-process table so the `Active` badge follows the newest event row instead of staying on the older bottom row.

v1.1.14 improvements:
- Synced the checked-in database create script with the live application schema so fresh installs match the current DB structure.
- Replaced older database migration clutter with a single stable full-data import snapshot file for copying a live system into a fresh database.
- Added a project rule requiring `database/create_employee_work_report_db.sql` to be updated on every database structure change.

v1.1.13 improvements:
- Redesigned the admin fault detail modal into a simpler text-first layout with fault header context and contact names in the header.
- Removed the top summary cards and regrouped editable fault fields into one horizontal operational row.
- Replaced the timeline cards with a treatment-process table that shows status, date, event name, creator, description, and order/tracking.
- Fault events are now created from a separate small modal instead of an always-visible inline form.

v1.1.12 improvements:
- Added full admin Hebrew copy coverage for the Faults tab, including filters, table labels, and the detail modal.
- Faults table no longer shows the `Ref` column in the list view.
- Faults table now starts with the fault creation date and keeps the latest action description in its own column.
- When a fault still has only the initial open event, the list shows the original fault description in that description column.

v1.1.11 improvements:
- Added manager-only Fault Registration Form creation from the worker/manager app.
- Added admin fault dashboard with flat fault table filters and a separate detail modal.
- Added fault timeline events and open / closed fault handling.
- Added SQL fault tables and a safe migration script for upgrading existing databases.
- Client contact email is now optional to support FRF contact capture from the field.

v1.1.10 improvements:
- Refactored the frontend into smaller admin, worker, and shared JavaScript modules without changing user workflows.
- Split backend routes and services by project domain while preserving the existing API contract.
- Removed stale unlinked frontend tab code from older endpoint models.

v1.1.9 improvements:
- Release bump for the approved admin hierarchy UI cleanup.
- Clients and Manufacturers now use the same clearer pane layout with bottom `Edit` / `Create` actions and no refresh buttons.

v1.1.8 improvements:
- Client admin workspace now keeps only create forms inline.
- Client, site, and contact editing now opens from a double-click modal instead of staying on the main pane.
- Client contact lists stay clearly visible and remain client-scoped while switching between sites.

v1.1.7 improvements:
- Split manager tools into internal tabs for car lists and external contractors.
- Contractor entries now support optional start/end time.
- External contractor reports now show the manager who registered each entry.

v1.1.6 improvements:
- Added employee manager permissions and a manager-only car list tool.
- Managers can select workers, open a fullscreen car/passport list, and share a WhatsApp-friendly Hebrew formatted message.

v1.1.5 improvements:
- Report tables now keep the header row and total row visible while scrolling.
- Header and total rows now share the same background treatment.
- Same-day continuation rows no longer use a gray background.
- Extra-hours entries now use an English `extra` badge instead of red row styling.

v1.1.4 improvements:
- Improved employee monthly report table readability for multiple entries on the same date.
- Added weekday badges next to report dates in the active admin language.
- Styled the report total row with clearer summary metrics.
- Fixed Hebrew RTL indentation for same-day continuation rows.
- Report weekday badges now update correctly when switching admin language.

v1.1.3 improvements:
- Added admin system settings for interface language and standard workday length.
- Added Hebrew admin UI labels with less technical wording for day-to-day use.
- Extra-hours reporting now uses the configured standard workday length.
- Statistics filters now stay on one horizontal line on desktop to leave more room for reports.
- Fixed the Statistics month picker icon so it is visible and clickable.

v1.1.2 improvements:
- Employees now support optional phone and email fields across SQL, API, and admin UI.
- Optional employee fields can now be cleared back to blank/null from the admin UI.

v1.1.1 improvements:
- Employee monthly reports now calculate and display extra hours for days over 10 total hours.
- Admin employee monthly reports highlight overtime rows in dim red.
- Statistics report tables now scroll correctly when many rows are shown.
- Test data was refreshed with Hebrew notes and overtime cases for realistic report testing.

v1.1.0 improvements:
- Added Codex project guidance in `AGENTS.md`, including version bump, database ownership, and frontend workflow rules.
- Added Playwright UI inspection scripts for browser screenshots and frontend polish.
- Added company logo branding to the login screen.
- Simplified the login screen by removing technical copy and making the primary login action full width.
- Documented UI scope: admin is desktop-first, worker screens remain mobile-responsive.

v1.0.6 improvements:
- Admin UI: Employee add/edit form is now arranged horizontally in rows (First/Last, Passport/Car, Card/Rate, Login/Password).
- Employees: added optional identifiers (passport_id, car_id, card_id).

v1.0.3 improvements:
- UI: removed JS-injected inline display styles; tab visibility is controlled by CSS classes.
- Employees: rate is now a **daily rate** (not hourly).
- Statistics → Project report: added **Days** column and changed cost formula to **days × daily_rate** (hours remain informational).
- Statistics tables: added a bold summary row at the bottom.

**Note:** the built-in admin account is a system/super-user and is **not** shown in the Employees list.

> Note: the **admin account** is a system super-user and is not managed from the Employees tab.

---

## Data Model

### employees
- first_name
- last_name
- passport_id
- car_id
- card_id
- phone
- email
- daily_rate (daily shift rate)
- login
- password_hash
- role (`admin` | `employee`)
- is_manager (employee manager permissions)

### projects
- name

### clients
- name
- is_active

### client_sites
- client_id
- name
- is_active

### client_contacts
- client_id
- name
- email (optional)
- phone
- is_active

### work_entries
- work_date (DATE)
- start_time (TIME)
- end_time (TIME)
- employee_id
- project_id
- notes

### contractor_entries
- service_date (DATE)
- start_time (TIME, optional)
- end_time (TIME, optional)
- manager_employee_id
- project_id
- contractor_name
- service_description
- service_cost (optional)

### fault_manufacturers
- name
- is_active

### fault_equipment_categories
- manufacturer_id
- name
- is_active

### fault_equipment_subcategories
- equipment_category_id
- name
- is_active

### faults
- fault_ref
- client_id
- client_custom
- site_id
- site_custom
- manufacturer_id
- manufacturer_custom
- equipment_category_id
- equipment_category_custom
- equipment_subcategory_id
- equipment_subcategory_custom
- support_level
- serial_number
- manufacturer_ticket_id
- fault_description
- status
- created_by
- created_at
- updated_at
- closed_at

### fault_contacts
- fault_id
- contact_id
- contact_name
- contact_email
- contact_phone

### fault_events
- fault_id
- title
- details
- order_id
- created_by
- created_at

---

## Architecture Rules

Layered structure (no mixing):

```
routes → services → dal/sql
```

---

## Running

1) Install
```bash
npm install
```

2) Create / edit `config.json` (auto-generated on first run)

3) Create DB
- Run: `database/create_employee_work_report_db.sql`
- No database migration is required for v1.1.16.
- To copy the current live data snapshot into a fresh DB, run: `database/import_employee_work_report_data.sql`

4) Start
```bash
npm start
```

Open:
- `http://localhost:<appPort>`

---

## Default Bootstrap Admin

The SQL script creates a bootstrap admin user:
- login: `admin`
- password: `admin`

**Important:** change it immediately in production.
