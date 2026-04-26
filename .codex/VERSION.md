Version: 1.2.21
Package version: 1.2.21
Date: 2026-04-26
Done:
- Removed Card ID from worker Personal settings.
- Added a centered password-change label and thin divider between personal details and password fields.
- No database migration required.

----------------------------------------

Version: 1.2.2
Package version: 1.2.2
Date: 2026-04-26
Done:
- Added a worker navbar gear menu with Personal settings, language toggle, and logout.
- Removed the standalone worker Logout button.
- Added employee self-service personal settings for ID, car ID, phone, email, and password.
- Required the current password before employees can change their own password.
- Sanitized employee-facing identity responses so worker APIs do not expose login, role, daily rate, or raw manager flags.
- Personal settings shows the employee first and last name as read-only context.
- Restored persistent worker English/Hebrew language selection from user settings.
- No database migration required.

----------------------------------------

Version: 1.2.1
Package version: 1.2.1
Date: 2026-04-26
Done:
- Forced the worker tab order to Clock, Reports, then Manager tools while preserving Hebrew content direction.
- Replaced report entry Edit/Delete buttons with a compact three-dot action menu.
- Removed car-list selection checkboxes; worker rows now toggle selection directly with clearer dividers.
- Right-aligned Hebrew car-list worker names and headers.
- Changed the generated car-list passport column label to ID / ת.ז.
- No database migration required.

----------------------------------------

Version: v1.2.00
Package version: 1.2.0
Date: 2026-04-26
Done:
- Added localized frontend validation for worker-surface forms, with English and Hebrew messages.
- Added structured API errors so the worker UI can show localized messages instead of raw backend text.
- Blocked overlapping same-day worker reports across all projects.
- Blocked active session starts inside an existing same-day report so workers cannot get stuck with an unclosable overlap.
- Limited the worker Start time picker to the next available time after existing completed entries for the day.
- Kept zero-duration placeholder entries valid and non-overlapping.

----------------------------------------

Version: v1.1.19
Date: 2026-04-26
Done:
- Hid the worker English/Hebrew toggle and made Hebrew the active worker language until settings are added.
- Added automatic redirect to login when authenticated frontend API calls return unauthorized.
- Added a session-expired message on the login screen.
- Removed the default Ready status under the punch-clock circle and reset clock status on worker tab changes.
- Limited stop-time choices to the active session start time through the current rounded server time.
- Allowed zero-duration work entries so workers can start and immediately stop to create a report-history placeholder.
- Added a full-screen company-color spinner while login is processing.
- Tuned mobile login fields to focus the keyboard more reliably and added a password visibility toggle.

----------------------------------------

Version: v1.1.18
Date: 2026-04-26
Done:
- Added worker recovery for active sessions left open from a previous day, with close or discard actions.
- Added a per-device English/Hebrew language toggle for the worker app.
- Polished the punch-clock circle so idle text is centered and active elapsed time includes seconds.

----------------------------------------

Version: v1.1.17
Date: 2026-04-26
Done:
- Replaced the worker manual Register day form with a mobile-first punch-clock flow.
- Added durable SQL-backed active work sessions so started work survives refresh, logout, or browser close.
- Added worker stop-time notes and completed-entry editing from View reports.
- Applied the bright opener visual language to the worker reporting interface.
- Added an idempotent v1.1.17 database migration for active work sessions.

----------------------------------------

Version: v1.1.16
Date: 2026-04-26
Done:
- Polished the opener/login screen with a cleaner logo-first layout, updated color palette, focused form styling, and restrained entrance motion.
- Added a left-to-right company logo reveal with reduced-motion support.
- Planned the new opener style language for wider frontend application, including color schemes, spacing, and control styling.

----------------------------------------

Version: v1.1.15
Date: 2026-04-24
Done:
- Fixed the fault detail treatment-process table so the `Active` badge is assigned to the newest event row when new events are added.

----------------------------------------

Version: v1.1.14
Date: 2026-04-24
Done:
- Synced the checked-in database create script with the live application schema, including the current employees and work entries columns.
- Consolidated the database folder to a fresh-create script plus one stable full-data import snapshot file.
- Added a project rule requiring the create script to be updated whenever the database structure changes.

----------------------------------------

Version: v1.1.13
Date: 2026-04-24
Done:
- Redesigned the admin fault detail modal into a simpler text-first layout with fault context and contact names in the header.
- Removed the top fault summary cards and regrouped editable support, serial, and manufacturer ticket fields into one row.
- Replaced timeline event cards with a treatment-process table including status, creation date, name, created by, description, and order/tracking.
- Moved new fault event creation into a separate modal launched from the main fault detail modal.

----------------------------------------

Version: v1.1.12
Date: 2026-04-24
Done:
- Added Hebrew admin translations and live language-switch wiring for the Faults tab, including the detail modal.
- Removed the Ref column from the admin Faults table.
- Added a created-date column and a separate latest-action description column to the Faults table.
- Faults with only the initial open event now show the original fault description in that description column.

----------------------------------------

Version: v1.1.11
Date: 2026-04-24
Done:
- Added manager-only Fault Registration Form (FRF) creation from the worker/manager app.
- Added admin fault dashboard with a flat fault table, detail modal, timeline events, and open/closed handling.
- Added SQL fault tables plus a safe migration script for upgrading existing databases.
- Client contact email is now optional to support FRF contacts captured in the field.

----------------------------------------

Version: v1.1.10
Date: 2026-04-24
Done:
- Refactored the frontend into smaller admin, worker, and shared JavaScript modules without changing user workflows.
- Split backend routes and services by project domain while preserving the existing API contract.
- Removed stale unlinked frontend tab code from older endpoint models.

----------------------------------------

Version: v1.1.9
Date: 2026-04-24
Done:
- Release bump for the approved admin hierarchy UI cleanup.
- Clients and Manufacturers now use the same clearer pane layout with bottom Edit / Create actions and no refresh buttons.

----------------------------------------

Version: v1.1.8
Date: 2026-04-23
Done:
- Client admin workspace now keeps only create forms inline.
- Client, site, and contact editing now opens from a double-click modal instead of staying on the main pane.
- Client contact lists stay clearly visible and remain client-scoped while switching between sites.

----------------------------------------

Version: v1.1.7
Date: 2026-04-23
Done:
- Split manager tools into internal tabs for car lists and external contractors.
- Contractor entries now support optional start/end time.
- External contractor reports now show the manager who registered each entry.

----------------------------------------

Version: v1.1.6
Date: 2026-04-23
Done:
- Added employee manager permissions and a manager-only car list tool.
- Managers can select workers, open a fullscreen car/passport list, and share a WhatsApp-friendly Hebrew formatted message.

----------------------------------------

Version: v1.1.5
Date: 2026-04-23
Done:
- Report tables now keep the header row and total row visible while scrolling.
- Header and total rows now share the same background treatment.
- Same-day continuation rows no longer use a gray background.
- Extra-hours entries now use an English `extra` badge instead of red row styling.

----------------------------------------

Version: v1.1.4
Date: 2026-04-23
Done:
- Improved employee monthly report table readability for multiple entries on the same date.
- Added weekday badges next to report dates in the active admin language.
- Styled the report total row with clearer summary metrics.
- Fixed Hebrew RTL indentation for same-day continuation rows.
- Report weekday badges now update correctly when switching admin language.

----------------------------------------

Version: v1.1.3
Date: 2026-04-23
Done:
- Added admin system settings for interface language and standard workday length.
- Added Hebrew admin UI labels with less technical wording for day-to-day use.
- Extra-hours reporting now uses the configured standard workday length.
- Statistics filters now stay on one horizontal line on desktop to leave more room for reports.
- Fixed the Statistics month picker icon so it is visible and clickable.

----------------------------------------

Version: v1.1.2
Date: 2026-04-23
Done:
- Employees now support optional phone and email fields across SQL, API, and admin UI.
- Optional employee fields can now be cleared back to blank/null from the admin UI.

----------------------------------------

Version: v1.1.1
Date: 2026-04-23
Done:
- Employee monthly reports now calculate and display extra hours for days over 10 total hours.
- Admin employee monthly reports highlight overtime rows in dim red.
- Statistics report tables now scroll correctly when many rows are shown.
- Test data was refreshed with Hebrew notes and overtime cases for realistic report testing.

----------------------------------------

Version: v1.1.0
Date: 2026-04-23
Done:
- Added Codex project guidance in .codex/AGENTS.md, including version bump, database ownership, and frontend workflow rules.
- Added Playwright UI inspection scripts for browser screenshots and frontend polish.
- Added company logo branding to the login screen.
- Simplified the login screen by removing technical copy and making the primary login action full width.
- Documented UI scope: admin is desktop-first, worker screens remain mobile-responsive.

----------------------------------------

Version: v1.0.6.1
Date: 2026-01-26
Done:
- Admin UI: enforce accordion behavior for all `<details>` blocks (only one open at a time; all closed on load and on tab switch).
- Admin UI: enable vertical scrolling inside accordion bodies.

----------------------------------------

Version: v1.0.6
Date: 2026-01-25
Done:
- Admin UI: employee add/edit form fields are arranged horizontally in 2-column rows.
- Employees: added optional identifiers (passport_id, car_id, card_id) across UI/API/SQL.
- Database: updated employees schema to include the new columns.

----------------------------------------

Version: v1.0.3
Date: 2026-01-07
Done:
- UI: removed JS-injected inline display styles; tabs now use CSS classes (no inline overrides).
- Employees: switched rate field to daily_rate (labelled "Daily rate").
- Statistics → Project report: added Days column (unique employee work-days), changed cost formula to days × daily_rate, and added a bold summary row at the bottom.
- Statistics → Employee report: added a summary row (total days) at the bottom.
- Database: schema updated to use employees.daily_rate.

----------------------------------------

Version: v1.0.2
Date: 2026-01-07
Done:
- Admin UI: added bottom status bar footer (MAG Control style) to keep layout anchored to the viewport.
- Admin UI: improved month/date picker icon visibility on dark background.
- Projects: disabled projects are excluded from the employee project list (and blocked in entry create/update).
- Employee UI: on mobile, entry cards keep meta + action button on the same horizontal line.

----------------------------------------

Version: v1.0.1
Date: 2026-01-07
Done:
- Admin UI: fixed list styling (removed native button appearance).
- Admin UI: admin user is hidden from Employees list; role selection removed (all created users are employees).
- Reports: fixed MSSQL DATE/TIME serialization (no 1970 timestamps).
- Statistics: employee/project monthly reports show correct data and are rendered as styled tables.
- Employee UI: split into two tabs (Register entry / View reports) and improved mobile responsiveness.

----------------------------------------

Version: v1.0.0
Date: 2026-01-07
Done:
- Initial release: employees/projects CRUD + employee work entry logging.
- Admin statistics: employee monthly report + project monthly report (hours & cost).
- Layered architecture: routes → services → dal/sql.
- MSSQL create script included.
