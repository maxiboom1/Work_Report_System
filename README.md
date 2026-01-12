# Employee Work Report System

**Version:** v1.0.5

Employee Work Report System is an internal full-stack web application that allows employees to report daily work hours per project, while giving administrators a dashboard for employee/project management and reporting.

The system is intentionally simple, predictable, and fast to operate in a company LAN environment.

---

## Roles

### Employee
- Login with personal credentials
- Create work entries
- Edit only **today** entries (until end of local day). Work date is locked.
- Cannot delete work entries (admin-only)
- Multiple entries per day (e.g. half day project A + half day project B)
- Mobile-friendly UI with 2 tabs:
  - Register day (add a new entry)
  - View reports (monthly entries)

### Admin
- CRUD Employees
- CRUD Projects
- Statistics:
  - Employee monthly report
  - Project monthly report (days & hours per employee + total cost)

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
- card_id
- car_id (optional)
- daily_rate (daily shift rate)
- login
- password_hash
- role (`admin` | `employee`)

### projects
- name

### work_entries
- work_date (DATE)
- start_time (TIME)
- end_time (TIME)
- employee_id
- project_id
- notes

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


## Changelog

### v1.0.4
- Admin: accordion sections (only one open at a time; all closed on load and on tab switch)
- Admin: Statistics renamed to Reports
- Employees: added Passport ID + Card ID fields; Daily rate must be > 0; removed Active from UI
- Reports (admin): per-entry Admin notes (admin-only) + row delete
- Validations: prevent future dates; prevent employee deletion of work entries; employee edit window limited to creation day (backend)
- Logging: added audit logs for major admin and user actions

### v1.0.5
- Employee UI: added **Edit entry** flow (only for entries created today)
- Employee edit: work date is locked (not editable)
- Employees: added optional **Car ID** field (DB + admin UI)
- DB create script updated to v1.0.5
- Employee UI: edit form matches the "Create new entry" UI; work date is not editable
- Employees: added **car_id** (optional) field + full wiring (UI → routes → services → SQL + DB create script)
