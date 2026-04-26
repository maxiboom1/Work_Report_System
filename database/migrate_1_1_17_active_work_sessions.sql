/* =========================================================
   Employee Work Report System - v1.1.17 migration
   Adds durable active worker punch-clock sessions.
   ========================================================= */

USE [employee_work_report];
GO

IF OBJECT_ID(N'dbo.[active_work_sessions]', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[active_work_sessions] (
    [id]          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_active_work_sessions PRIMARY KEY,
    [employee_id] INT NOT NULL,
    [project_id]  INT NOT NULL,
    [work_date]   DATE NOT NULL,
    [start_time]  TIME(0) NOT NULL,
    [created_at]  DATETIME2(0) NOT NULL CONSTRAINT DF_active_work_sessions_created_at DEFAULT (SYSDATETIME()),
    [updated_at]  DATETIME2(0) NULL
  );

  ALTER TABLE dbo.[active_work_sessions]
    ADD CONSTRAINT FK_active_work_sessions_employee
    FOREIGN KEY([employee_id]) REFERENCES dbo.[employees]([id])
    ON DELETE NO ACTION;

  ALTER TABLE dbo.[active_work_sessions]
    ADD CONSTRAINT FK_active_work_sessions_project
    FOREIGN KEY([project_id]) REFERENCES dbo.[projects]([id])
    ON DELETE NO ACTION;

  CREATE UNIQUE INDEX UX_active_work_sessions_employee ON dbo.[active_work_sessions]([employee_id]);
  CREATE INDEX IX_active_work_sessions_project_date ON dbo.[active_work_sessions]([project_id],[work_date]);
END
GO
