# Agent Notes

## Current State

Employee Work Report System is a working Node.js/Express application backed by Microsoft SQL Server.

- App version: `1.1.18`.
- Runtime entry point: `app.js`.
- Backend layers follow `routes -> services -> dal/sql`.
- SQL access is centralized in `src/1-dal/sql.js` and business logic is in `src/4-services`.
- UI is static HTML/CSS/JS under `webpage/`.
- Build target is a Windows executable via `npm run build:exe`.
- Local configuration lives in `config.json` and is intentionally ignored by git.
- MSSQL connectivity was verified from this workspace against the configured `employee_work_report` database on SQL Server Express.

## Required Rules

- For every version bump, update the version everywhere it appears across the project, including at minimum:
  - `package.json`
  - `package-lock.json`
  - `src/3-utilities/app-config.js`
  - `README.md`
  - `.codex/VERSION.md`
  - `.codex/AGENTS.md`
  - database scripts or comments that mention the release version
- Every version bump must also update `README.md` and `.codex/VERSION.md` with the relevant user-facing changes.
- Database structure changes are owned by Codex. Do not ask the user to manually patch schema unless direct database access is unavailable.
- Schema changes must be reflected in SQL scripts and in the DAL/service code that depends on them.
- Every database structure change must update `database/create_employee_work_report_db.sql` so a fresh database matches the current live app schema.
- Keep secrets and local runtime files out of git. `.codex/` may track Markdown project docs only; non-Markdown `.codex` files, `config.json`, `logs/`, `dist/`, `build/`, and `node_modules/` should stay ignored.

## Frontend Work

- Main near-term focus is frontend polish.
- Codex frontend/browser skills have been installed locally: `frontend-skill`, `playwright`, `playwright-interactive`, and `screenshot`. Restart Codex if they are not visible in the active skills list.
- Admin UI is a desktop/workstation surface. Do not spend effort adapting the admin experience to mobile unless explicitly requested.
- Worker/user UI must be responsive and comfortable on mobile because workers mostly enter reports from phones.
- Worker reporting uses the punch-clock flow: a durable active session starts first, then stopping creates the completed work entry.
- v1.1.18 adds worker stale-session recovery and a per-device English/Hebrew toggle for the worker app.
- The login/startup screen should stay minimal, friendly, and brand-led: company logo first, short labels, no technical session or environment copy.
- The new opener visual language from v1.1.16 is planned to expand across the frontend, including color schemes, spacing, and control styling.
- Use Playwright for browser inspection and screenshots:
  - `npm run inspect:ui` captures screenshots into `tmp/ui-snapshots`.
  - `npm run inspect:ui:headed` opens a visible Chrome/Edge browser for interactive inspection.
- Prefer checking desktop widths for admin work, and both desktop and mobile widths for login and worker/user UI.
- Visual changes should keep the app operational and should not bypass auth or API flows.
