/* =========================================================
   Employee Work Report System - data import snapshot
   Source version: v1.1.19
   Exported at: 2026-04-24 18:24:46

   Run this AFTER:
   - database/create_employee_work_report_db.sql

   This script replaces all application data in the target DB
   with the exported data from the source environment.

   Export counts:
- employees: 5
- projects: 5
- app_settings: 2
- clients: 4
- client_sites: 6
- client_contacts: 4
- fault_manufacturers: 4
- fault_equipment_categories: 18
- fault_equipment_subcategories: 15
- faults: 4
- fault_contacts: 5
- fault_events: 13
- work_entries: 186
- contractor_entries: 3
   ========================================================= */

USE [employee_work_report];

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
  BEGIN TRANSACTION;

DELETE FROM dbo.[fault_events];
DELETE FROM dbo.[fault_contacts];
DELETE FROM dbo.[active_work_sessions];
DELETE FROM dbo.[work_entries];
DELETE FROM dbo.[contractor_entries];
DELETE FROM dbo.[faults];
DELETE FROM dbo.[client_contacts];
DELETE FROM dbo.[client_sites];
DELETE FROM dbo.[fault_equipment_subcategories];
DELETE FROM dbo.[fault_equipment_categories];
DELETE FROM dbo.[fault_manufacturers];
DELETE FROM dbo.[clients];
DELETE FROM dbo.[app_settings];
DELETE FROM dbo.[projects];
DELETE FROM dbo.[employees];

SET IDENTITY_INSERT dbo.[employees] ON;
INSERT INTO dbo.[employees] ([id], [first_name], [last_name], [passport_id], [car_id], [card_id], [phone], [email], [daily_rate], [login], [password_hash], [role], [is_manager], [is_active], [created_at], [updated_at])
VALUES
  (1, N'Admin', N'User', NULL, NULL, NULL, NULL, NULL, 0, N'admin', N'admin', N'admin', 0, 1, CAST(N'2026-01-12 14:01:08' AS datetime2), CAST(N'2026-01-12 14:01:08' AS datetime2)),
  (2, N'Alex', N'Samih-zade', N'313009763', N'530-55-69', N'313', NULL, NULL, 900, N'alex', N'$2b$10$Tl9pbTIN1YXEHDy2bOmPw.erNBujbZ/w2Gbw.dPQx8CcrmGjF9pcK', N'employee', 0, 1, CAST(N'2026-01-12 14:02:05' AS datetime2), CAST(N'2026-01-12 14:02:05' AS datetime2)),
  (3, N'Asaf', N'Orlovski', N'TST-AO-001', N'AO-17', N'1001', NULL, NULL, 900, N'asaf.orlovski', N'$2b$10$KSjLRk5LHpzgA59WrTEJYOYNrSSlL3ftB/eBqoiBUXTf0EeAjlFeG', N'employee', 1, 1, CAST(N'2026-04-23 10:40:16' AS datetime2), CAST(N'2026-04-23 10:40:16' AS datetime2)),
  (4, N'Elimeleh', N'Rezeman', N'TST-ER-002', N'ER-28', N'1002', NULL, NULL, 850, N'elimeleh.rezeman', N'$2b$10$KSjLRk5LHpzgA59WrTEJYOYNrSSlL3ftB/eBqoiBUXTf0EeAjlFeG', N'employee', 0, 1, CAST(N'2026-04-23 10:40:16' AS datetime2), CAST(N'2026-04-23 10:40:16' AS datetime2)),
  (5, N'Asaf', N'Hasson', N'TST-AH-003', N'AH-39', N'1003', NULL, NULL, 920, N'asaf', N'$2b$10$Q.lTLONxeNcarHwvvCNA9.vN/CL9syL50wflbbmOSJ2yVP/J1Ad4K', N'employee', 1, 1, CAST(N'2026-04-23 10:40:16' AS datetime2), CAST(N'2026-04-23 10:40:16' AS datetime2));
SET IDENTITY_INSERT dbo.[employees] OFF;
DBCC CHECKIDENT (N'dbo.[employees]', RESEED, 5) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[projects] ON;
INSERT INTO dbo.[projects] ([id], [name], [is_active], [created_at])
VALUES
  (1, N'Internal', 1, CAST(N'2026-01-12 14:01:08' AS datetime2)),
  (2, N'ערוץ הכלכלי', 1, CAST(N'2026-01-12 14:02:42' AS datetime2)),
  (3, N'תאגיד השידור - מטריצה', 1, CAST(N'2026-01-12 14:02:59' AS datetime2)),
  (4, N'רכבים - מסווג', 1, CAST(N'2026-01-12 14:03:20' AS datetime2)),
  (5, N'עיניים בחוץ', 1, CAST(N'2026-01-12 14:03:27' AS datetime2));
SET IDENTITY_INSERT dbo.[projects] OFF;
DBCC CHECKIDENT (N'dbo.[projects]', RESEED, 5) WITH NO_INFOMSGS;

INSERT INTO dbo.[app_settings] ([setting_key], [setting_value], [updated_at])
VALUES
  (N'admin_language', N'he', CAST(N'2026-04-24 18:39:53' AS datetime2)),
  (N'workday_hours', N'9.75', CAST(N'2026-04-24 18:39:53' AS datetime2));

SET IDENTITY_INSERT dbo.[clients] ON;
INSERT INTO dbo.[clients] ([id], [name], [is_active], [created_at], [updated_at])
VALUES
  (3, N'תאגיד השידור', 1, CAST(N'2026-04-23 23:25:41' AS datetime2), NULL),
  (4, N'רשת 13', 1, CAST(N'2026-04-23 23:26:09' AS datetime2), NULL),
  (7, N'RGE', 1, CAST(N'2026-04-23 23:40:26' AS datetime2), NULL),
  (12, N'TLV STUDIOS', 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[clients] OFF;
DBCC CHECKIDENT (N'dbo.[clients]', RESEED, 12) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[client_sites] ON;
INSERT INTO dbo.[client_sites] ([id], [client_id], [name], [is_active], [created_at], [updated_at])
VALUES
  (3, 3, N'ירושלים', 1, CAST(N'2026-04-23 23:25:57' AS datetime2), NULL),
  (4, 3, N'פארק נעימי', 1, CAST(N'2026-04-23 23:26:03' AS datetime2), CAST(N'2026-04-23 23:41:26' AS datetime2)),
  (5, 4, N'חדשות 13 נווה אילן', 1, CAST(N'2026-04-23 23:26:21' AS datetime2), NULL),
  (6, 4, N'רמת החייל', 1, CAST(N'2026-04-23 23:26:27' AS datetime2), NULL),
  (11, 7, N'הרצליה', 1, CAST(N'2026-04-23 23:40:49' AS datetime2), NULL),
  (16, 12, N'TLV', 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[client_sites] OFF;
DBCC CHECKIDENT (N'dbo.[client_sites]', RESEED, 16) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[client_contacts] ON;
INSERT INTO dbo.[client_contacts] ([id], [client_id], [name], [email], [phone], [is_active], [created_at], [updated_at])
VALUES
  (3, 3, N'שגיב אבנטוב', N'sagive@kan.org.il', N'+972528015348', 1, CAST(N'2026-04-23 23:27:54' AS datetime2), CAST(N'2026-04-23 23:52:31' AS datetime2)),
  (8, 3, N'שי לוי (שהיד)', N'shay@kan.org.il', N'0527477770', 1, CAST(N'2026-04-23 23:39:14' AS datetime2), NULL),
  (13, 3, N'Field Contact', NULL, N'0501234567', 1, CAST(N'2026-04-24 17:24:09' AS datetime2), NULL),
  (14, 12, N'דני נחמיאס', NULL, NULL, 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[client_contacts] OFF;
DBCC CHECKIDENT (N'dbo.[client_contacts]', RESEED, 14) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[fault_manufacturers] ON;
INSERT INTO dbo.[fault_manufacturers] ([id], [name], [is_active], [created_at], [updated_at])
VALUES
  (3, N'CALREC', 1, CAST(N'2026-04-23 22:49:35' AS datetime2), CAST(N'2026-04-23 22:51:19' AS datetime2)),
  (4, N'ROSS', 1, CAST(N'2026-04-23 22:58:46' AS datetime2), NULL),
  (5, N'TELOS', 1, CAST(N'2026-04-23 22:59:07' AS datetime2), NULL),
  (9, N'AJA', 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[fault_manufacturers] OFF;
DBCC CHECKIDENT (N'dbo.[fault_manufacturers]', RESEED, 9) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[fault_equipment_categories] ON;
INSERT INTO dbo.[fault_equipment_categories] ([id], [manufacturer_id], [name], [is_active], [created_at], [updated_at])
VALUES
  (3, 3, N'ARTEMIS', 1, CAST(N'2026-04-23 22:50:04' AS datetime2), NULL),
  (4, 3, N'ARGO-S', 1, CAST(N'2026-04-23 22:50:13' AS datetime2), NULL),
  (5, 3, N'ARGO-M', 1, CAST(N'2026-04-23 22:50:18' AS datetime2), NULL),
  (6, 3, N'BRIO', 1, CAST(N'2026-04-23 22:50:29' AS datetime2), NULL),
  (7, 3, N'MODULAR IO', 1, CAST(N'2026-04-23 22:52:10' AS datetime2), NULL),
  (8, 3, N'IO DEVICES', 1, CAST(N'2026-04-23 22:52:26' AS datetime2), NULL),
  (9, 3, N'IMPULSE CORE', 1, CAST(N'2026-04-23 22:54:06' AS datetime2), NULL),
  (10, 3, N'IMPULSE-1', 1, CAST(N'2026-04-23 22:54:15' AS datetime2), NULL),
  (11, 3, N'HYDRA2 CORE', 1, CAST(N'2026-04-23 22:57:30' AS datetime2), NULL),
  (12, 4, N'OG/OGX FRAME CARDS', 1, CAST(N'2026-04-23 22:59:58' AS datetime2), NULL),
  (13, 4, N'ULTRIX', 1, CAST(N'2026-04-23 23:00:07' AS datetime2), NULL),
  (14, 4, N'CARBONITE', 1, CAST(N'2026-04-23 23:00:11' AS datetime2), NULL),
  (15, 4, N'TRIA VTR', 1, CAST(N'2026-04-23 23:00:28' AS datetime2), NULL),
  (16, 4, N'ROBOTICS', 1, CAST(N'2026-04-23 23:00:38' AS datetime2), NULL),
  (17, 5, N'INFINITY INTERCOM', 1, CAST(N'2026-04-23 23:01:08' AS datetime2), NULL),
  (18, 5, N'VX HYBRIDS', 1, CAST(N'2026-04-23 23:01:31' AS datetime2), NULL),
  (19, 5, N'AIExpressor', 1, CAST(N'2026-04-23 23:01:44' AS datetime2), NULL),
  (23, 9, N'ROUTERS', 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[fault_equipment_categories] OFF;
DBCC CHECKIDENT (N'dbo.[fault_equipment_categories]', RESEED, 23) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[fault_equipment_subcategories] ON;
INSERT INTO dbo.[fault_equipment_subcategories] ([id], [equipment_category_id], [name], [is_active], [created_at], [updated_at])
VALUES
  (3, 3, N'FADER PANEL', 1, CAST(N'2026-04-23 22:51:39' AS datetime2), NULL),
  (4, 5, N'FADER PANEL', 1, CAST(N'2026-04-23 22:54:34' AS datetime2), NULL),
  (5, 4, N'FADER PANEL', 1, CAST(N'2026-04-23 22:54:55' AS datetime2), NULL),
  (6, 3, N'TFT PANEL', 0, CAST(N'2026-04-23 22:55:05' AS datetime2), CAST(N'2026-04-23 22:57:42' AS datetime2)),
  (7, 3, N'PC CLIENT', 1, CAST(N'2026-04-23 22:55:22' AS datetime2), NULL),
  (8, 6, N'SURFACE', 1, CAST(N'2026-04-23 22:55:35' AS datetime2), NULL),
  (9, 9, N'DSP', 1, CAST(N'2026-04-23 22:55:45' AS datetime2), NULL),
  (10, 9, N'ROUTER', 1, CAST(N'2026-04-23 22:55:48' AS datetime2), NULL),
  (11, 3, N'DSP', 1, CAST(N'2026-04-23 22:56:21' AS datetime2), NULL),
  (12, 3, N'ROUTER', 0, CAST(N'2026-04-23 22:56:28' AS datetime2), CAST(N'2026-04-23 22:57:40' AS datetime2)),
  (13, 11, N'CONTROL CARD', 1, CAST(N'2026-04-23 22:58:11' AS datetime2), NULL),
  (14, 11, N'DSP CARD', 1, CAST(N'2026-04-23 22:58:17' AS datetime2), NULL),
  (15, 11, N'ROUTER CARD', 1, CAST(N'2026-04-23 22:58:26' AS datetime2), NULL),
  (16, 11, N'PSU', 1, CAST(N'2026-04-23 22:58:35' AS datetime2), NULL),
  (20, 23, N'KUMO', 1, CAST(N'2026-04-24 17:59:28' AS datetime2), NULL);
SET IDENTITY_INSERT dbo.[fault_equipment_subcategories] OFF;
DBCC CHECKIDENT (N'dbo.[fault_equipment_subcategories]', RESEED, 20) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[faults] ON;
INSERT INTO dbo.[faults] ([id], [fault_ref], [client_id], [client_custom], [site_id], [site_custom], [manufacturer_id], [manufacturer_custom], [equipment_category_id], [equipment_category_custom], [equipment_subcategory_id], [equipment_subcategory_custom], [support_level], [serial_number], [manufacturer_ticket_id], [fault_description], [status], [created_by], [created_at], [updated_at], [closed_at])
VALUES
  (2, N'FLT-2026-0001', 3, NULL, 3, NULL, 3, NULL, 3, NULL, 7, NULL, N'layer2_support', N'123456', NULL, N'פאנל 3 מימין - לא נדלק. ביצעתי ריסטרט ולא עזר. התנל התקול נאסף - והוחלף בפאנל זמני של הלקוח', 1, 5, CAST(N'2026-04-24 17:42:05' AS datetime2), CAST(N'2026-04-24 18:41:02' AS datetime2), NULL),
  (3, N'FLT-2026-0002', 12, N'TLV STUDIOS', 16, N'TLV', 9, N'AJA', 23, N'ROUTERS', 20, N'KUMO', N'no_support', N'123123', NULL, N'המטריצה לא נדלקת', 0, 5, CAST(N'2026-04-24 17:59:28' AS datetime2), CAST(N'2026-04-24 19:42:08' AS datetime2), CAST(N'2026-04-24 19:42:08' AS datetime2)),
  (4, N'FLT-2026-0003', 3, NULL, 4, NULL, 3, NULL, 9, NULL, 9, NULL, N'layer2_support', N'123456', NULL, N'יש נפילות בתקשורת - בעיה כללית של המערכת - לא בהחרך IMPULSE', 1, 5, CAST(N'2026-04-24 18:42:43' AS datetime2), NULL, NULL),
  (5, N'FLT-2026-0004', 3, NULL, 4, NULL, 3, NULL, 6, NULL, 8, NULL, N'layer2_support', NULL, NULL, N'יש תקלה מוזרה - הפיידרים לפעמים מעבדים את השיוך לערוצי אודיאו והאודיאו נפרץ לבד', 1, 5, CAST(N'2026-04-24 18:58:30' AS datetime2), NULL, NULL);
SET IDENTITY_INSERT dbo.[faults] OFF;
DBCC CHECKIDENT (N'dbo.[faults]', RESEED, 5) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[fault_contacts] ON;
INSERT INTO dbo.[fault_contacts] ([id], [fault_id], [contact_id], [contact_name], [contact_email], [contact_phone])
VALUES
  (3, 2, 3, N'שגיב אבנטוב', N'sagive@kan.org.il', N'+972528015348'),
  (4, 2, 8, N'שי לוי (שהיד)', N'shay@kan.org.il', N'0527477770'),
  (5, 3, 14, N'דני נחמיאס', NULL, NULL),
  (6, 4, 3, N'שגיב אבנטוב', N'sagive@kan.org.il', N'+972528015348'),
  (7, 5, 3, N'שגיב אבנטוב', N'sagive@kan.org.il', N'+972528015348');
SET IDENTITY_INSERT dbo.[fault_contacts] OFF;
DBCC CHECKIDENT (N'dbo.[fault_contacts]', RESEED, 7) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[fault_events] ON;
INSERT INTO dbo.[fault_events] ([id], [fault_id], [title], [details], [order_id], [created_by], [created_at])
VALUES
  (4, 2, N'Fault opened', NULL, NULL, 5, CAST(N'2026-04-24 17:42:05' AS datetime2)),
  (5, 2, N'נשלח מייל ליצרן', N'ממתינים לתשובה', NULL, 1, CAST(N'2026-04-24 17:44:54' AS datetime2)),
  (6, 2, N'Fault closed', NULL, NULL, 1, CAST(N'2026-04-24 17:48:59' AS datetime2)),
  (7, 3, N'Fault opened', NULL, NULL, 5, CAST(N'2026-04-24 17:59:28' AS datetime2)),
  (8, 3, N'נשלח ליצרן', N'נשלח ליצרן', NULL, 1, CAST(N'2026-04-24 18:36:42' AS datetime2)),
  (9, 3, N'Fault closed', NULL, NULL, 1, CAST(N'2026-04-24 18:40:48' AS datetime2)),
  (10, 2, N'Fault reopened', NULL, NULL, 1, CAST(N'2026-04-24 18:40:54' AS datetime2)),
  (11, 4, N'Fault opened', NULL, NULL, 5, CAST(N'2026-04-24 18:42:43' AS datetime2)),
  (12, 4, N'המשך טיפול', N'יש נפילות בתקשורת - בעיה כללית של המערכת - הוחלף ספק', NULL, 1, CAST(N'2026-04-24 18:50:13' AS datetime2)),
  (13, 5, N'Fault opened', NULL, NULL, 5, CAST(N'2026-04-24 18:58:30' AS datetime2)),
  (14, 3, N'Fault reopened', NULL, NULL, 1, CAST(N'2026-04-24 19:42:04' AS datetime2)),
  (15, 3, N'Fault closed', NULL, NULL, 1, CAST(N'2026-04-24 19:42:08' AS datetime2)),
  (16, 5, N'test', N'test', NULL, 1, CAST(N'2026-04-24 21:23:44' AS datetime2));
SET IDENTITY_INSERT dbo.[fault_events] OFF;
DBCC CHECKIDENT (N'dbo.[fault_events]', RESEED, 16) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[work_entries] ON;
INSERT INTO dbo.[work_entries] ([id], [employee_id], [project_id], [work_date], [start_time], [end_time], [notes], [admin_notes], [created_at], [updated_at])
VALUES
  (1, 2, 1, CAST(N'2026-01-12' AS date), CAST(N'09:00:00' AS time), CAST(N'16:00:00' AS time), N'חנייה - 100 שח', N'מאושר', CAST(N'2026-01-12 14:03:58' AS datetime2), CAST(N'2026-01-25 17:57:07' AS datetime2)),
  (2, 2, 1, CAST(N'2026-01-12' AS date), CAST(N'19:00:00' AS time), CAST(N'21:00:00' AS time), N'', N'', CAST(N'2026-01-12 14:12:00' AS datetime2), CAST(N'2026-01-12 14:12:00' AS datetime2)),
  (3, 2, 1, CAST(N'2026-04-23' AS date), CAST(N'09:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 08:45:39' AS datetime2), CAST(N'2026-04-23 08:45:39' AS datetime2)),
  (198, 3, 3, CAST(N'2026-01-25' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (199, 4, 4, CAST(N'2026-01-25' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (200, 5, 5, CAST(N'2026-01-25' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (201, 3, 4, CAST(N'2026-01-26' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (202, 4, 5, CAST(N'2026-01-26' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (203, 5, 2, CAST(N'2026-01-26' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (204, 3, 5, CAST(N'2026-01-27' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (205, 4, 2, CAST(N'2026-01-27' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (206, 3, 2, CAST(N'2026-01-28' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (207, 5, 1, CAST(N'2026-01-28' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (208, 5, 5, CAST(N'2026-01-28' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (209, 4, 1, CAST(N'2026-01-29' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (210, 4, 5, CAST(N'2026-01-29' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (211, 5, 5, CAST(N'2026-01-29' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (212, 3, 1, CAST(N'2026-02-01' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (213, 3, 5, CAST(N'2026-02-01' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (214, 4, 5, CAST(N'2026-02-01' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (215, 5, 2, CAST(N'2026-02-01' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (216, 3, 5, CAST(N'2026-02-02' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (217, 4, 2, CAST(N'2026-02-02' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (218, 5, 3, CAST(N'2026-02-02' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (219, 3, 2, CAST(N'2026-02-03' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (220, 4, 3, CAST(N'2026-02-03' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (221, 3, 3, CAST(N'2026-02-04' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (222, 5, 5, CAST(N'2026-02-04' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (223, 4, 5, CAST(N'2026-02-05' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (224, 5, 1, CAST(N'2026-02-05' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (225, 5, 3, CAST(N'2026-02-05' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (226, 3, 5, CAST(N'2026-02-08' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (227, 4, 1, CAST(N'2026-02-08' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (228, 4, 3, CAST(N'2026-02-08' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (229, 5, 3, CAST(N'2026-02-08' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (230, 3, 1, CAST(N'2026-02-09' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (231, 3, 3, CAST(N'2026-02-09' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (232, 4, 3, CAST(N'2026-02-09' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (233, 5, 1, CAST(N'2026-02-09' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (234, 5, 5, CAST(N'2026-02-09' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (235, 3, 3, CAST(N'2026-02-10' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (236, 4, 1, CAST(N'2026-02-10' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (237, 4, 5, CAST(N'2026-02-10' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (238, 3, 1, CAST(N'2026-02-11' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (239, 3, 5, CAST(N'2026-02-11' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (240, 5, 2, CAST(N'2026-02-11' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (241, 4, 2, CAST(N'2026-02-12' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (242, 5, 3, CAST(N'2026-02-12' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (243, 3, 2, CAST(N'2026-02-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (244, 4, 3, CAST(N'2026-02-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (245, 5, 4, CAST(N'2026-02-15' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (246, 3, 3, CAST(N'2026-02-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (247, 4, 4, CAST(N'2026-02-16' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (248, 5, 5, CAST(N'2026-02-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (249, 3, 4, CAST(N'2026-02-17' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (250, 4, 5, CAST(N'2026-02-17' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (251, 3, 5, CAST(N'2026-02-18' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (252, 5, 3, CAST(N'2026-02-18' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (253, 4, 3, CAST(N'2026-02-19' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (254, 5, 4, CAST(N'2026-02-19' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (255, 3, 3, CAST(N'2026-02-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (256, 4, 4, CAST(N'2026-02-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (257, 5, 5, CAST(N'2026-02-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (258, 3, 4, CAST(N'2026-02-23' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (259, 4, 5, CAST(N'2026-02-23' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (260, 5, 1, CAST(N'2026-02-23' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (261, 5, 3, CAST(N'2026-02-23' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (262, 3, 5, CAST(N'2026-02-24' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (263, 4, 1, CAST(N'2026-02-24' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (264, 4, 3, CAST(N'2026-02-24' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (265, 3, 1, CAST(N'2026-02-25' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (266, 3, 3, CAST(N'2026-02-25' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (267, 5, 4, CAST(N'2026-02-25' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (268, 4, 4, CAST(N'2026-02-26' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (269, 5, 5, CAST(N'2026-02-26' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (270, 3, 4, CAST(N'2026-03-01' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (271, 4, 5, CAST(N'2026-03-01' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (272, 5, 1, CAST(N'2026-03-01' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (273, 5, 3, CAST(N'2026-03-01' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (274, 3, 5, CAST(N'2026-03-02' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (275, 4, 1, CAST(N'2026-03-02' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (276, 4, 3, CAST(N'2026-03-02' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (277, 5, 3, CAST(N'2026-03-02' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (278, 3, 1, CAST(N'2026-03-03' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (279, 3, 3, CAST(N'2026-03-03' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (280, 4, 3, CAST(N'2026-03-03' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (281, 3, 3, CAST(N'2026-03-04' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (282, 5, 5, CAST(N'2026-03-04' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (283, 4, 5, CAST(N'2026-03-05' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (284, 5, 2, CAST(N'2026-03-05' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (285, 3, 5, CAST(N'2026-03-08' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (286, 4, 2, CAST(N'2026-03-08' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (287, 5, 3, CAST(N'2026-03-08' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (288, 3, 2, CAST(N'2026-03-09' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (289, 4, 3, CAST(N'2026-03-09' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (290, 5, 4, CAST(N'2026-03-09' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (291, 3, 3, CAST(N'2026-03-10' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (292, 4, 4, CAST(N'2026-03-10' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (293, 3, 4, CAST(N'2026-03-11' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (294, 5, 2, CAST(N'2026-03-11' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (295, 4, 2, CAST(N'2026-03-12' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (296, 5, 3, CAST(N'2026-03-12' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (297, 3, 2, CAST(N'2026-03-15' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (298, 4, 3, CAST(N'2026-03-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (299, 5, 4, CAST(N'2026-03-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (300, 3, 3, CAST(N'2026-03-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (301, 4, 4, CAST(N'2026-03-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (302, 5, 5, CAST(N'2026-03-16' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (303, 3, 4, CAST(N'2026-03-17' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (304, 4, 5, CAST(N'2026-03-17' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (305, 3, 5, CAST(N'2026-03-18' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (306, 5, 3, CAST(N'2026-03-18' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (307, 4, 3, CAST(N'2026-03-19' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (308, 5, 1, CAST(N'2026-03-19' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (309, 5, 5, CAST(N'2026-03-19' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (310, 3, 3, CAST(N'2026-03-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (311, 4, 1, CAST(N'2026-03-22' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (312, 4, 5, CAST(N'2026-03-22' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (313, 5, 5, CAST(N'2026-03-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (314, 3, 1, CAST(N'2026-03-23' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (315, 3, 5, CAST(N'2026-03-23' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (316, 4, 5, CAST(N'2026-03-23' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (317, 5, 2, CAST(N'2026-03-23' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (318, 3, 5, CAST(N'2026-03-24' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (319, 4, 2, CAST(N'2026-03-24' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (320, 3, 2, CAST(N'2026-03-25' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (321, 5, 4, CAST(N'2026-03-25' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (322, 4, 4, CAST(N'2026-03-26' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (323, 5, 5, CAST(N'2026-03-26' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (324, 3, 4, CAST(N'2026-03-29' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (325, 4, 5, CAST(N'2026-03-29' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (326, 5, 1, CAST(N'2026-03-29' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (327, 5, 3, CAST(N'2026-03-29' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (328, 3, 5, CAST(N'2026-03-30' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (329, 4, 1, CAST(N'2026-03-30' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (330, 4, 3, CAST(N'2026-03-30' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (331, 5, 3, CAST(N'2026-03-30' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (332, 3, 1, CAST(N'2026-03-31' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (333, 3, 3, CAST(N'2026-03-31' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (334, 4, 3, CAST(N'2026-03-31' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (335, 3, 3, CAST(N'2026-04-01' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (336, 5, 5, CAST(N'2026-04-01' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (337, 4, 5, CAST(N'2026-04-02' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (338, 5, 2, CAST(N'2026-04-02' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (339, 3, 5, CAST(N'2026-04-05' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (340, 4, 2, CAST(N'2026-04-05' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (341, 5, 3, CAST(N'2026-04-05' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (342, 3, 2, CAST(N'2026-04-06' AS date), CAST(N'09:00:00' AS time), CAST(N'14:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (343, 4, 3, CAST(N'2026-04-06' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (344, 5, 4, CAST(N'2026-04-06' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (345, 3, 3, CAST(N'2026-04-07' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (346, 4, 4, CAST(N'2026-04-07' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (347, 3, 4, CAST(N'2026-04-08' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (348, 5, 1, CAST(N'2026-04-08' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (349, 5, 3, CAST(N'2026-04-08' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (350, 4, 1, CAST(N'2026-04-09' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (351, 4, 3, CAST(N'2026-04-09' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (352, 5, 3, CAST(N'2026-04-09' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (353, 3, 1, CAST(N'2026-04-12' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (354, 3, 3, CAST(N'2026-04-12' AS date), CAST(N'12:00:00' AS time), CAST(N'20:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (355, 4, 3, CAST(N'2026-04-12' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (356, 5, 4, CAST(N'2026-04-12' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תמיכה מרחוק', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (357, 3, 3, CAST(N'2026-04-13' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (358, 4, 4, CAST(N'2026-04-13' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (359, 5, 5, CAST(N'2026-04-13' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פיתוח ובדיקות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (360, 3, 4, CAST(N'2026-04-14' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (361, 4, 5, CAST(N'2026-04-14' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיאום עם הצוות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (362, 3, 5, CAST(N'2026-04-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (363, 5, 3, CAST(N'2026-04-15' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'פגישה עם הלקוח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (364, 4, 3, CAST(N'2026-04-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'עבודה בשטח', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (365, 5, 4, CAST(N'2026-04-16' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (366, 3, 3, CAST(N'2026-04-19' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (367, 4, 4, CAST(N'2026-04-19' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (368, 5, 5, CAST(N'2026-04-19' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'יום ארוך לסגירת משימות', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (369, 3, 4, CAST(N'2026-04-20' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (370, 4, 5, CAST(N'2026-04-20' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'תיקונים דחופים', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (371, 5, 2, CAST(N'2026-04-20' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (372, 3, 5, CAST(N'2026-04-21' AS date), CAST(N'08:00:00' AS time), CAST(N'19:30:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (373, 4, 2, CAST(N'2026-04-21' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (374, 3, 2, CAST(N'2026-04-22' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (375, 5, 1, CAST(N'2026-04-22' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'הכנת חומרים למסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (376, 5, 5, CAST(N'2026-04-22' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'השלמות אחרי בדיקה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (377, 4, 1, CAST(N'2026-04-23' AS date), CAST(N'08:00:00' AS time), CAST(N'12:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (378, 4, 5, CAST(N'2026-04-23' AS date), CAST(N'12:00:00' AS time), CAST(N'17:00:00' AS time), N'בדיקות לפני מסירה', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (379, 5, 5, CAST(N'2026-04-23' AS date), CAST(N'08:00:00' AS time), CAST(N'17:00:00' AS time), N'', N'', CAST(N'2026-04-23 11:09:46' AS datetime2), CAST(N'2026-04-23 11:09:46' AS datetime2)),
  (380, 5, 1, CAST(N'2026-04-23' AS date), CAST(N'09:00:00' AS time), CAST(N'17:00:00' AS time), N'טסט', N'', CAST(N'2026-04-23 18:58:13' AS datetime2), CAST(N'2026-04-23 18:58:13' AS datetime2));
SET IDENTITY_INSERT dbo.[work_entries] OFF;
DBCC CHECKIDENT (N'dbo.[work_entries]', RESEED, 380) WITH NO_INFOMSGS;

SET IDENTITY_INSERT dbo.[contractor_entries] ON;
INSERT INTO dbo.[contractor_entries] ([id], [manager_employee_id], [project_id], [service_date], [start_time], [end_time], [contractor_name], [service_description], [service_cost], [created_at], [updated_at])
VALUES
  (4, 5, 3, CAST(N'2026-04-23' AS date), NULL, NULL, N'אורי תכלת', N'הגדרות מיקסר ארגו בנעימי תאגיד', 1200, CAST(N'2026-04-23 21:28:50' AS datetime2), CAST(N'2026-04-23 21:30:03' AS datetime2)),
  (8, 5, 5, CAST(N'2026-04-24' AS date), NULL, NULL, N'אלי קפלן', N'תליית מסכים - קונטרול', 1000, CAST(N'2026-04-24 14:43:02' AS datetime2), NULL),
  (9, 5, 2, CAST(N'2026-04-24' AS date), CAST(N'11:00:00' AS time), CAST(N'18:00:00' AS time), N'קפלן', N'היה אמור לתלות מבכים, אבל בעיקר אכל שוורמה', 500, CAST(N'2026-04-24 15:33:49' AS datetime2), CAST(N'2026-04-24 15:34:22' AS datetime2));
SET IDENTITY_INSERT dbo.[contractor_entries] OFF;
DBCC CHECKIDENT (N'dbo.[contractor_entries]', RESEED, 9) WITH NO_INFOMSGS;

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
