# Employee Work Report System

**Version:** v1.1.0

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

### Admin
- CRUD Employees
- CRUD Projects
- Statistics:
  - Employee monthly report
  - Project monthly report (days & hours per employee + total cost)
- Admin screens are intended for desktop/workstation use and are not a mobile UI target.

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
