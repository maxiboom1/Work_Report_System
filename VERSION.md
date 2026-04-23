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
- Added Codex project guidance in AGENTS.md, including version bump, database ownership, and frontend workflow rules.
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
