/* =========================================================
   Employee Work Report System — MSSQL Create Script
   Version: v1.1.11

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

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

/* =======================
   2) Drop tables (DEV)
   ======================= */

IF OBJECT_ID(N'dbo.[work_entries]', N'U') IS NOT NULL DROP TABLE dbo.[work_entries];
IF OBJECT_ID(N'dbo.[contractor_entries]', N'U') IS NOT NULL DROP TABLE dbo.[contractor_entries];
IF OBJECT_ID(N'dbo.[fault_events]', N'U') IS NOT NULL DROP TABLE dbo.[fault_events];
IF OBJECT_ID(N'dbo.[fault_contacts]', N'U') IS NOT NULL DROP TABLE dbo.[fault_contacts];
IF OBJECT_ID(N'dbo.[faults]', N'U') IS NOT NULL DROP TABLE dbo.[faults];
IF OBJECT_ID(N'dbo.[client_contacts]', N'U') IS NOT NULL DROP TABLE dbo.[client_contacts];
IF OBJECT_ID(N'dbo.[client_sites]', N'U') IS NOT NULL DROP TABLE dbo.[client_sites];
IF OBJECT_ID(N'dbo.[clients]', N'U') IS NOT NULL DROP TABLE dbo.[clients];
IF OBJECT_ID(N'dbo.[fault_equipment_subcategories]', N'U') IS NOT NULL DROP TABLE dbo.[fault_equipment_subcategories];
IF OBJECT_ID(N'dbo.[fault_equipment_categories]', N'U') IS NOT NULL DROP TABLE dbo.[fault_equipment_categories];
IF OBJECT_ID(N'dbo.[fault_manufacturers]', N'U') IS NOT NULL DROP TABLE dbo.[fault_manufacturers];
IF OBJECT_ID(N'dbo.[app_settings]', N'U') IS NOT NULL DROP TABLE dbo.[app_settings];
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
  [phone]        NVARCHAR(40)  NULL,
  [email]        NVARCHAR(120) NULL,
  [daily_rate]   DECIMAL(10,2) NOT NULL,
  [login]        NVARCHAR(80)  NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [role]         NVARCHAR(20)  NOT NULL CONSTRAINT DF_employees_role DEFAULT('employee'),
  [is_manager]   BIT           NOT NULL CONSTRAINT DF_employees_is_manager DEFAULT(0),
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

-- Clients
CREATE TABLE dbo.[clients] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_clients PRIMARY KEY,
  [name]       NVARCHAR(120) NOT NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_clients_is_active DEFAULT(1),
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_clients_created_at DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2(0) NULL
);
GO

CREATE UNIQUE INDEX UX_clients_name ON dbo.[clients]([name]);
GO

-- Client sites
CREATE TABLE dbo.[client_sites] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_client_sites PRIMARY KEY,
  [client_id]  INT NOT NULL,
  [name]       NVARCHAR(120) NOT NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_client_sites_is_active DEFAULT(1),
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_client_sites_created_at DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[client_sites]
  ADD CONSTRAINT FK_client_sites_client
  FOREIGN KEY([client_id]) REFERENCES dbo.[clients]([id])
  ON DELETE NO ACTION;
GO

CREATE UNIQUE INDEX UX_client_sites_parent_name ON dbo.[client_sites]([client_id], [name]);
CREATE INDEX IX_client_sites_client ON dbo.[client_sites]([client_id]);
GO

-- Client contact managers
CREATE TABLE dbo.[client_contacts] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_client_contacts PRIMARY KEY,
  [client_id]  INT NOT NULL,
  [name]       NVARCHAR(120) NOT NULL,
  [email]      NVARCHAR(160) NULL,
  [phone]      NVARCHAR(40) NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_client_contacts_is_active DEFAULT(1),
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_client_contacts_created_at DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[client_contacts]
  ADD CONSTRAINT FK_client_contacts_client
  FOREIGN KEY([client_id]) REFERENCES dbo.[clients]([id])
  ON DELETE NO ACTION;
GO

CREATE UNIQUE INDEX UX_client_contacts_parent_email ON dbo.[client_contacts]([client_id], [email]) WHERE [email] IS NOT NULL;
CREATE INDEX IX_client_contacts_client ON dbo.[client_contacts]([client_id]);
GO

-- App settings
CREATE TABLE dbo.[app_settings] (
  [setting_key]   NVARCHAR(80)  NOT NULL CONSTRAINT PK_app_settings PRIMARY KEY,
  [setting_value] NVARCHAR(400) NOT NULL,
  [updated_at]    DATETIME2(0)  NOT NULL CONSTRAINT DF_app_settings_updated_at DEFAULT (SYSDATETIME())
);
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

-- Contractor entries
CREATE TABLE dbo.[contractor_entries] (
  [id]                  INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_contractor_entries PRIMARY KEY,
  [manager_employee_id] INT NOT NULL,
  [project_id]          INT NOT NULL,
  [service_date]        DATE NOT NULL CONSTRAINT DF_contractor_entries_service_date DEFAULT (CONVERT(date, SYSDATETIME())),
  [start_time]          TIME(0) NULL,
  [end_time]            TIME(0) NULL,
  [contractor_name]     NVARCHAR(120) NOT NULL,
  [service_description] NVARCHAR(600) NOT NULL,
  [service_cost]        DECIMAL(10,2) NULL,
  [created_at]          DATETIME2(0) NOT NULL CONSTRAINT DF_contractor_entries_created_at DEFAULT (SYSDATETIME()),
  [updated_at]          DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[contractor_entries]
  ADD CONSTRAINT FK_contractor_entries_manager
  FOREIGN KEY([manager_employee_id]) REFERENCES dbo.[employees]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[contractor_entries]
  ADD CONSTRAINT FK_contractor_entries_project
  FOREIGN KEY([project_id]) REFERENCES dbo.[projects]([id])
  ON DELETE NO ACTION;
GO

CREATE INDEX IX_contractor_entries_service_date ON dbo.[contractor_entries]([service_date]);
CREATE INDEX IX_contractor_entries_project_date ON dbo.[contractor_entries]([project_id],[service_date]);
GO

-- Fault manufacturers
CREATE TABLE dbo.[fault_manufacturers] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_manufacturers PRIMARY KEY,
  [name]       NVARCHAR(120) NOT NULL,
  [is_active]  BIT NOT NULL CONSTRAINT DF_fault_manufacturers_is_active DEFAULT(1),
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_fault_manufacturers_created_at DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2(0) NULL
);
GO

CREATE UNIQUE INDEX UX_fault_manufacturers_name ON dbo.[fault_manufacturers]([name]);
GO

-- Fault equipment/model categories
CREATE TABLE dbo.[fault_equipment_categories] (
  [id]              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_equipment_categories PRIMARY KEY,
  [manufacturer_id] INT NOT NULL,
  [name]            NVARCHAR(120) NOT NULL,
  [is_active]       BIT NOT NULL CONSTRAINT DF_fault_equipment_categories_is_active DEFAULT(1),
  [created_at]      DATETIME2(0) NOT NULL CONSTRAINT DF_fault_equipment_categories_created_at DEFAULT (SYSDATETIME()),
  [updated_at]      DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[fault_equipment_categories]
  ADD CONSTRAINT FK_fault_equipment_categories_manufacturer
  FOREIGN KEY([manufacturer_id]) REFERENCES dbo.[fault_manufacturers]([id])
  ON DELETE NO ACTION;
GO

CREATE UNIQUE INDEX UX_fault_equipment_categories_parent_name ON dbo.[fault_equipment_categories]([manufacturer_id], [name]);
CREATE INDEX IX_fault_equipment_categories_manufacturer ON dbo.[fault_equipment_categories]([manufacturer_id]);
GO

-- Fault equipment/model subcategories
CREATE TABLE dbo.[fault_equipment_subcategories] (
  [id]                    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_equipment_subcategories PRIMARY KEY,
  [equipment_category_id] INT NOT NULL,
  [name]                  NVARCHAR(120) NOT NULL,
  [is_active]             BIT NOT NULL CONSTRAINT DF_fault_equipment_subcategories_is_active DEFAULT(1),
  [created_at]            DATETIME2(0) NOT NULL CONSTRAINT DF_fault_equipment_subcategories_created_at DEFAULT (SYSDATETIME()),
  [updated_at]            DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[fault_equipment_subcategories]
  ADD CONSTRAINT FK_fault_equipment_subcategories_category
  FOREIGN KEY([equipment_category_id]) REFERENCES dbo.[fault_equipment_categories]([id])
  ON DELETE NO ACTION;
GO

CREATE UNIQUE INDEX UX_fault_equipment_subcategories_parent_name ON dbo.[fault_equipment_subcategories]([equipment_category_id], [name]);
CREATE INDEX IX_fault_equipment_subcategories_category ON dbo.[fault_equipment_subcategories]([equipment_category_id]);
GO

-- Faults
CREATE TABLE dbo.[faults] (
  [id]                           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_faults PRIMARY KEY,
  [fault_ref]                    NVARCHAR(20) NOT NULL,
  [client_id]                    INT NULL,
  [client_custom]                NVARCHAR(120) NULL,
  [site_id]                      INT NULL,
  [site_custom]                  NVARCHAR(120) NULL,
  [manufacturer_id]              INT NULL,
  [manufacturer_custom]          NVARCHAR(120) NULL,
  [equipment_category_id]        INT NULL,
  [equipment_category_custom]    NVARCHAR(120) NULL,
  [equipment_subcategory_id]     INT NULL,
  [equipment_subcategory_custom] NVARCHAR(120) NULL,
  [support_level]                NVARCHAR(30) NOT NULL,
  [serial_number]                NVARCHAR(80) NULL,
  [manufacturer_ticket_id]       NVARCHAR(80) NULL,
  [fault_description]            NVARCHAR(MAX) NULL,
  [status]                       BIT NOT NULL CONSTRAINT DF_faults_status DEFAULT(1),
  [created_by]                   INT NOT NULL,
  [created_at]                   DATETIME2(0) NOT NULL CONSTRAINT DF_faults_created_at DEFAULT (SYSDATETIME()),
  [updated_at]                   DATETIME2(0) NULL,
  [closed_at]                    DATETIME2(0) NULL
);
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_client
  FOREIGN KEY([client_id]) REFERENCES dbo.[clients]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_site
  FOREIGN KEY([site_id]) REFERENCES dbo.[client_sites]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_manufacturer
  FOREIGN KEY([manufacturer_id]) REFERENCES dbo.[fault_manufacturers]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_category
  FOREIGN KEY([equipment_category_id]) REFERENCES dbo.[fault_equipment_categories]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_subcategory
  FOREIGN KEY([equipment_subcategory_id]) REFERENCES dbo.[fault_equipment_subcategories]([id])
  ON DELETE NO ACTION;
GO

ALTER TABLE dbo.[faults]
  ADD CONSTRAINT FK_faults_created_by
  FOREIGN KEY([created_by]) REFERENCES dbo.[employees]([id])
  ON DELETE NO ACTION;
GO

CREATE UNIQUE INDEX UX_faults_fault_ref ON dbo.[faults]([fault_ref]);
CREATE INDEX IX_faults_created_at ON dbo.[faults]([created_at]);
CREATE INDEX IX_faults_status ON dbo.[faults]([status]);
CREATE INDEX IX_faults_client ON dbo.[faults]([client_id]);
CREATE INDEX IX_faults_manufacturer ON dbo.[faults]([manufacturer_id]);
GO

CREATE TABLE dbo.[fault_contacts] (
  [id]            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_contacts PRIMARY KEY,
  [fault_id]      INT NOT NULL,
  [contact_id]    INT NULL,
  [contact_name]  NVARCHAR(120) NOT NULL,
  [contact_email] NVARCHAR(160) NULL,
  [contact_phone] NVARCHAR(40) NULL
);
GO

ALTER TABLE dbo.[fault_contacts]
  ADD CONSTRAINT FK_fault_contacts_fault
  FOREIGN KEY([fault_id]) REFERENCES dbo.[faults]([id])
  ON DELETE CASCADE;
GO

ALTER TABLE dbo.[fault_contacts]
  ADD CONSTRAINT FK_fault_contacts_contact
  FOREIGN KEY([contact_id]) REFERENCES dbo.[client_contacts]([id])
  ON DELETE NO ACTION;
GO

CREATE INDEX IX_fault_contacts_fault ON dbo.[fault_contacts]([fault_id]);
GO

CREATE TABLE dbo.[fault_events] (
  [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_events PRIMARY KEY,
  [fault_id]   INT NOT NULL,
  [title]      NVARCHAR(200) NOT NULL,
  [details]    NVARCHAR(MAX) NULL,
  [order_id]   NVARCHAR(120) NULL,
  [created_by] INT NOT NULL,
  [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_fault_events_created_at DEFAULT (SYSDATETIME())
);
GO

ALTER TABLE dbo.[fault_events]
  ADD CONSTRAINT FK_fault_events_fault
  FOREIGN KEY([fault_id]) REFERENCES dbo.[faults]([id])
  ON DELETE CASCADE;
GO

ALTER TABLE dbo.[fault_events]
  ADD CONSTRAINT FK_fault_events_created_by
  FOREIGN KEY([created_by]) REFERENCES dbo.[employees]([id])
  ON DELETE NO ACTION;
GO

CREATE INDEX IX_fault_events_fault_created ON dbo.[fault_events]([fault_id], [created_at]);
GO

/* =======================
   4) Seed admin (DEV)
   ======================= */

-- Default admin: login=admin password=admin (hash should be replaced by app on first run if you implement that later)
-- For now, store as plain text to allow initial bootstrap; app should hash on first login/change.
INSERT INTO dbo.[employees]
  ([first_name],[last_name],[passport_id],[car_id],[card_id],[phone],[email],[daily_rate],[login],[password_hash],[role],[is_manager],[is_active])
VALUES
  (N'Admin', N'User', NULL, NULL, NULL, NULL, NULL, 1.00, N'admin', N'admin', N'admin', 0, 1);
GO

INSERT INTO dbo.[app_settings] ([setting_key], [setting_value])
VALUES
  (N'admin_language', N'en'),
  (N'workday_hours', N'9');
GO
