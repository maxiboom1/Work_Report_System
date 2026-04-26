# Agent Notes

## Current State

Employee Work Report System is a working Node.js/Express application backed by Microsoft SQL Server.

- App version: `1.2.23`.
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
- Before applying any user-requested version bump, compare it against the current app version as semantic numeric components. The new version must be greater than the current version; if it is equal or lower, stop and clarify instead of downgrading or reusing an older version.
- Every version bump must also update `README.md` and `.codex/VERSION.md` with the relevant user-facing changes.
- Database structure changes are owned by Codex. Do not ask the user to manually patch schema unless direct database access is unavailable.
- Schema changes must be reflected in SQL scripts and in the DAL/service code that depends on them.
- Every database structure change must update the current `database/create_employee_work_report_db_<version>.sql` script so a fresh database matches the current live app schema.
- Keep secrets and local runtime files out of git. `.codex/` may track Markdown project docs only; non-Markdown `.codex` files, `config.json`, `logs/`, `dist/`, `build/`, and `node_modules/` should stay ignored.

## Context Cleanup / Compression Protocol

When chat context approaches compression, or when the user says:

`context cleanup`

Codex must pause implementation work and perform the protocol below.

### Step 1 — Pre-Compression Handoff

Before compression, produce a compact handoff summary containing:

- Current implementation state  
- Current version and milestone  
- Files changed or expected to change  
- Open design decisions  
- Unresolved risks or suspected bugs  
- Immediate next implementation step  
- Validation already completed  
- Validation still required  

Treat these as governing sources of truth:

- `.codex/AGENTS.md`
- `README.md`
- `.codex/VERSION.md`
- Active ExecPlan (if one exists)

During this step:

- Do not begin new implementation work  
- Do not expand scope  
- Only prepare resumable handoff context

If compressed chat memory conflicts with repository documents, repository documents win.

---

### Step 2 — Post-Compression Re-Anchor

After compression (or after any resumed compressed context), before coding:

1. Re-read `.codex/AGENTS.md`
2. Re-read `.codex/VERSION.md`
3. Re-read relevant `README.md` sections
4. Re-read active ExecPlan, if present
5. Restate:
   - current task
   - immediate next step
   - risks to watch

Only then continue implementation.

Do not rely solely on compressed chat memory for project state.

Repository files are the source of truth.

---


## Frontend Work

- Main near-term focus is frontend polish.
- Codex frontend/browser skills have been installed locally: `frontend-skill`, `playwright`, `playwright-interactive`, and `screenshot`. Restart Codex if they are not visible in the active skills list.
- Admin UI is a desktop/workstation surface. Do not spend effort adapting the admin experience to mobile unless explicitly requested.
- Worker/user UI must be responsive and comfortable on mobile because workers mostly enter reports from phones.
- Worker reporting uses the punch-clock flow: a durable active session starts first, then stopping creates the completed work entry.
- In Hebrew UI and documentation, use `ת.ז` for the employee identifier label instead of `דרכון`.
- v1.1.18 adds worker stale-session recovery and worker i18n infrastructure.
- v1.1.19 keeps the worker app Hebrew-only by default, hides the language toggle until settings are added, redirects expired API sessions to login, removes default clock status noise, allows zero-duration placeholder entries, and adds the opener login spinner/password polish.
- v1.2.00 adds localized worker-surface frontend validation, blocks overlapping same-day worker reports across all projects, and limits worker Start times to the next available time after completed same-day entries.
- 1.2.1 polishes worker UI navigation, report entry action menus, and manager car-list row selection/alignment.
- 1.2.2 adds worker user settings, self-service password change, persistent worker language selection, and stricter employee-facing privacy.
- 1.2.21 removes Card ID from worker personal settings and separates the password-change fields with a labeled divider.
- 1.2.22 shows `שלום, First Last` in the worker navbar for the signed-in employee while keeping `/api/auth/me` limited to display name plus capability flags.
- 1.2.23 uses explicit checkboxes for manager car-list worker selection; keep the checkbox column fixed and before worker names in both English LTR and Hebrew RTL layouts.
- The login/startup screen should stay minimal, friendly, and brand-led: company logo first, short labels, no technical session or environment copy.
- The new opener visual language from v1.1.16 is planned to expand across the frontend, including color schemes, spacing, and control styling.
- Use Playwright for browser inspection and screenshots:
  - `npm run inspect:ui` captures screenshots into `tmp/ui-snapshots`.
  - `npm run inspect:ui:headed` opens a visible Chrome/Edge browser for interactive inspection.
- Prefer checking desktop widths for admin work, and both desktop and mobile widths for login and worker/user UI.
- Visual changes should keep the app operational and should not bypass auth or API flows.
