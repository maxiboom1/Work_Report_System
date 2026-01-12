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
