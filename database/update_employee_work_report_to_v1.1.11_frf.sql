/* =========================================================
   Employee Work Report System - Migration to v1.1.11
   Adds FRF faults domain and relaxes client contact email.
   ========================================================= */

USE [employee_work_report];
GO

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.client_contacts', 'email') IS NOT NULL
BEGIN
  ALTER TABLE dbo.[client_contacts] ALTER COLUMN [email] NVARCHAR(160) NULL;
END
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_client_contacts_parent_email' AND object_id = OBJECT_ID(N'dbo.[client_contacts]'))
BEGIN
  DROP INDEX UX_client_contacts_parent_email ON dbo.[client_contacts];
END
GO

CREATE UNIQUE INDEX UX_client_contacts_parent_email ON dbo.[client_contacts]([client_id], [email]) WHERE [email] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.[faults]', N'U') IS NULL
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_client')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_client
    FOREIGN KEY([client_id]) REFERENCES dbo.[clients]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_site')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_site
    FOREIGN KEY([site_id]) REFERENCES dbo.[client_sites]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_manufacturer')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_manufacturer
    FOREIGN KEY([manufacturer_id]) REFERENCES dbo.[fault_manufacturers]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_category')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_category
    FOREIGN KEY([equipment_category_id]) REFERENCES dbo.[fault_equipment_categories]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_subcategory')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_subcategory
    FOREIGN KEY([equipment_subcategory_id]) REFERENCES dbo.[fault_equipment_subcategories]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_faults_created_by')
BEGIN
  ALTER TABLE dbo.[faults]
    ADD CONSTRAINT FK_faults_created_by
    FOREIGN KEY([created_by]) REFERENCES dbo.[employees]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_faults_fault_ref' AND object_id = OBJECT_ID(N'dbo.[faults]'))
BEGIN
  CREATE UNIQUE INDEX UX_faults_fault_ref ON dbo.[faults]([fault_ref]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_faults_created_at' AND object_id = OBJECT_ID(N'dbo.[faults]'))
BEGIN
  CREATE INDEX IX_faults_created_at ON dbo.[faults]([created_at]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_faults_status' AND object_id = OBJECT_ID(N'dbo.[faults]'))
BEGIN
  CREATE INDEX IX_faults_status ON dbo.[faults]([status]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_faults_client' AND object_id = OBJECT_ID(N'dbo.[faults]'))
BEGIN
  CREATE INDEX IX_faults_client ON dbo.[faults]([client_id]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_faults_manufacturer' AND object_id = OBJECT_ID(N'dbo.[faults]'))
BEGIN
  CREATE INDEX IX_faults_manufacturer ON dbo.[faults]([manufacturer_id]);
END
GO

IF OBJECT_ID(N'dbo.[fault_contacts]', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[fault_contacts] (
    [id]            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_contacts PRIMARY KEY,
    [fault_id]      INT NOT NULL,
    [contact_id]    INT NULL,
    [contact_name]  NVARCHAR(120) NOT NULL,
    [contact_email] NVARCHAR(160) NULL,
    [contact_phone] NVARCHAR(40) NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_fault_contacts_fault')
BEGIN
  ALTER TABLE dbo.[fault_contacts]
    ADD CONSTRAINT FK_fault_contacts_fault
    FOREIGN KEY([fault_id]) REFERENCES dbo.[faults]([id])
    ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_fault_contacts_contact')
BEGIN
  ALTER TABLE dbo.[fault_contacts]
    ADD CONSTRAINT FK_fault_contacts_contact
    FOREIGN KEY([contact_id]) REFERENCES dbo.[client_contacts]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_fault_contacts_fault' AND object_id = OBJECT_ID(N'dbo.[fault_contacts]'))
BEGIN
  CREATE INDEX IX_fault_contacts_fault ON dbo.[fault_contacts]([fault_id]);
END
GO

IF OBJECT_ID(N'dbo.[fault_events]', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[fault_events] (
    [id]         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_fault_events PRIMARY KEY,
    [fault_id]   INT NOT NULL,
    [title]      NVARCHAR(200) NOT NULL,
    [details]    NVARCHAR(MAX) NULL,
    [order_id]   NVARCHAR(120) NULL,
    [created_by] INT NOT NULL,
    [created_at] DATETIME2(0) NOT NULL CONSTRAINT DF_fault_events_created_at DEFAULT (SYSDATETIME())
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_fault_events_fault')
BEGIN
  ALTER TABLE dbo.[fault_events]
    ADD CONSTRAINT FK_fault_events_fault
    FOREIGN KEY([fault_id]) REFERENCES dbo.[faults]([id])
    ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_fault_events_created_by')
BEGIN
  ALTER TABLE dbo.[fault_events]
    ADD CONSTRAINT FK_fault_events_created_by
    FOREIGN KEY([created_by]) REFERENCES dbo.[employees]([id])
    ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_fault_events_fault_created' AND object_id = OBJECT_ID(N'dbo.[fault_events]'))
BEGIN
  CREATE INDEX IX_fault_events_fault_created ON dbo.[fault_events]([fault_id], [created_at]);
END
GO
