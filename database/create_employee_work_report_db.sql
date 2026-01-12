/* =========================================================
   Employee Work Report System — MSSQL Create Script
   Version: v1.0.4

   Tables:
     - employees
     - projects
     - work_entries

   Notes:
     - This is a DEV-friendly full create script (drop/recreate ok).
     - Passwords are stored in employees.password_hash.
       The app supports bcrypt hashes and a bootstrap plaintext password (dev only).
   ========================================================= */

-- 1) Create DB (if not exists)
IF DB_ID(N'employee_work_report') IS NULL
BEGIN
  CREATE DATABASE [employee_work_report];
END
GO

USE [employee_work_report];
GO

/* =======================
   2) Drop existing tables (dev only)
   ======================= */
IF OBJECT_ID(N'dbo.[work_entries]', N'U') IS NOT NULL DROP TABLE dbo.[work_entries];
IF OBJECT_ID(N'dbo.[projects]', N'U') IS NOT NULL DROP TABLE dbo.[projects];
IF OBJECT_ID(N'dbo.[employees]', N'U') IS NOT NULL DROP TABLE dbo.[employees];
GO

/* =======================
   3) Create tables
   ======================= */

-- Employees
CREATE TABLE dbo.[employees] (
  [id]            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_employees PRIMARY KEY,
  [first_name]    NVARCHAR(100) NOT NULL,
  [last_name]     NVARCHAR(100) NOT NULL,
  [passport_id]  NVARCHAR(50) NULL,
  [card_id]      NVARCHAR(50) NULL,
  [daily_rate]   DECIMAL(12,2) NOT NULL CONSTRAINT DF_employees_daily_rate DEFAULT (0),
  [login]         NVARCHAR(100) NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [role]          NVARCHAR(20) NOT NULL CONSTRAINT DF_employees_role DEFAULT ('employee'),
  [is_active]     BIT NOT NULL CONSTRAINT DF_employees_is_active DEFAULT (1),
  [created_at]    DATETIME2 NOT NULL CONSTRAINT DF_employees_created_at DEFAULT (SYSUTCDATETIME()),
  [updated_at]    DATETIME2 NOT NULL CONSTRAINT DF_employees_updated_at DEFAULT (SYSUTCDATETIME())
);

CREATE UNIQUE INDEX UX_employees_login ON dbo.[employees]([login]);
GO

-- Projects
CREATE TABLE dbo.[projects] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_projects PRIMARY KEY,
  [name]       NVARCHAR(200) NOT NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_projects_is_active DEFAULT (1),
  [created_at] DATETIME2 NOT NULL CONSTRAINT DF_projects_created_at DEFAULT (SYSUTCDATETIME())
);

CREATE UNIQUE INDEX UX_projects_name ON dbo.[projects]([name]);
GO

-- Work Entries
CREATE TABLE dbo.[work_entries] (
  [id]          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_work_entries PRIMARY KEY,
  [employee_id] INT NOT NULL,
  [project_id]  INT NOT NULL,
  [work_date]   DATE NOT NULL,
  [start_time]  TIME(0) NOT NULL,
  [end_time]    TIME(0) NOT NULL,
  [notes]       NVARCHAR(1000) NOT NULL CONSTRAINT DF_work_entries_notes DEFAULT (''),
  [admin_notes] NVARCHAR(1000) NOT NULL CONSTRAINT DF_work_entries_admin_notes DEFAULT (''),
  [created_at]  DATETIME2 NOT NULL CONSTRAINT DF_work_entries_created_at DEFAULT (SYSUTCDATETIME()),
  [updated_at]  DATETIME2 NOT NULL CONSTRAINT DF_work_entries_updated_at DEFAULT (SYSUTCDATETIME())
);

ALTER TABLE dbo.[work_entries]
  ADD CONSTRAINT FK_work_entries_employees
  FOREIGN KEY ([employee_id]) REFERENCES dbo.[employees]([id])
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE dbo.[work_entries]
  ADD CONSTRAINT FK_work_entries_projects
  FOREIGN KEY ([project_id]) REFERENCES dbo.[projects]([id])
  ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

/* =======================
   4) Seed (bootstrap)
   ======================= */

-- Bootstrap admin (DEV): login=admin / password=admin
IF NOT EXISTS (SELECT 1 FROM dbo.[employees] WHERE [login] = 'admin')
BEGIN
  INSERT INTO dbo.[employees] (first_name, last_name, daily_rate, login, password_hash, role, is_active)
  VALUES ('Admin', 'User', 0.00, 'admin', 'admin', 'admin', 1);
END
GO

-- Example project (optional)
IF NOT EXISTS (SELECT 1 FROM dbo.[projects] WHERE [name] = 'Internal')
BEGIN
  INSERT INTO dbo.[projects] ([name]) VALUES ('Internal');
END
GO

PRINT 'Employee Work Report DB created.';
