/* =========================================================
   Employee Work Report System — MSSQL Create Script
   Version: v1.1.1

   DEV NOTE:
   - This script is for development / local installs.
   - It drops and recreates tables (data will be LOST).
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
   2) Drop tables (DEV)
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
  [id]           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_employees PRIMARY KEY,
  [first_name]   NVARCHAR(60)  NOT NULL,
  [last_name]    NVARCHAR(60)  NOT NULL,
  [passport_id]  NVARCHAR(40)  NULL,
  [car_id]       NVARCHAR(40)  NULL,
  [card_id]      NVARCHAR(40)  NULL,
  [daily_rate]   DECIMAL(10,2) NOT NULL,
  [login]        NVARCHAR(80)  NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [role]         NVARCHAR(20)  NOT NULL CONSTRAINT DF_employees_role DEFAULT('employee'),
  [is_active]    BIT           NOT NULL CONSTRAINT DF_employees_is_active DEFAULT(1),
  [created_at]   DATETIME2(0)  NOT NULL CONSTRAINT DF_employees_created_at DEFAULT (SYSDATETIME())
);
GO

CREATE UNIQUE INDEX UX_employees_login ON dbo.[employees]([login]);
GO

-- Projects
CREATE TABLE dbo.[projects] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_projects PRIMARY KEY,
  [name]       NVARCHAR(120) NOT NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_projects_is_active DEFAULT(1),
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_projects_created_at DEFAULT (SYSDATETIME())
);
GO

CREATE UNIQUE INDEX UX_projects_name ON dbo.[projects]([name]);
GO

-- Work entries
CREATE TABLE dbo.[work_entries] (
  [id]          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_work_entries PRIMARY KEY,
  [employee_id] INT NOT NULL,
  [project_id]  INT NOT NULL,
  [work_date]   DATE NOT NULL,
  [start_time]  TIME(0) NOT NULL,
  [end_time]    TIME(0) NOT NULL,
  [notes]       NVARCHAR(400) NULL,
  [created_at]  DATETIME2(0) NOT NULL CONSTRAINT DF_work_entries_created_at DEFAULT (SYSDATETIME()),
  [updated_at]  DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[work_entries]
  ADD CONSTRAINT FK_work_entries_employee
  FOREIGN KEY([employee_id]) REFERENCES dbo.[employees]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[work_entries]
  ADD CONSTRAINT FK_work_entries_project
  FOREIGN KEY([project_id]) REFERENCES dbo.[projects]([id])
  ON DELETE NO ACTION;
GO

CREATE INDEX IX_work_entries_employee_date ON dbo.[work_entries]([employee_id],[work_date]);
CREATE INDEX IX_work_entries_project_date ON dbo.[work_entries]([project_id],[work_date]);
GO

/* =======================
   4) Seed admin (DEV)
   ======================= */

-- Default admin: login=admin password=admin (hash should be replaced by app on first run if you implement that later)
-- For now, store as plain text to allow initial bootstrap; app should hash on first login/change.
INSERT INTO dbo.[employees]
  ([first_name],[last_name],[passport_id],[car_id],[card_id],[daily_rate],[login],[password_hash],[role],[is_active])
VALUES
  (N'Admin', N'User', NULL, NULL, NULL, 1.00, N'admin', N'admin', N'admin', 1);
GO
