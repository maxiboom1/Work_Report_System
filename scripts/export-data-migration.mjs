import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import db from "../src/1-dal/sql.js";

const TABLES = [
  "employees",
  "projects",
  "app_settings",
  "clients",
  "client_sites",
  "client_contacts",
  "fault_manufacturers",
  "fault_equipment_categories",
  "fault_equipment_subcategories",
  "faults",
  "fault_contacts",
  "fault_events",
  "active_work_sessions",
  "work_entries",
  "contractor_entries",
];

const DELETE_ORDER = [
  "fault_events",
  "fault_contacts",
  "work_entries",
  "contractor_entries",
  "faults",
  "client_contacts",
  "client_sites",
  "fault_equipment_subcategories",
  "fault_equipment_categories",
  "fault_manufacturers",
  "clients",
  "app_settings",
  "projects",
  "employees",
];

const CREATE_SCRIPT_PATH = join(process.cwd(), "database", "create_employee_work_report_db.sql");

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestampParts(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return {
    stamp: `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}`,
    display: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`,
  };
}

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dateUtcLiteral(value) {
  const yyyy = value.getUTCFullYear();
  const mm = pad(value.getUTCMonth() + 1);
  const dd = pad(value.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

function timeUtcLiteral(value) {
  const hh = pad(value.getUTCHours());
  const mm = pad(value.getUTCMinutes());
  const ss = pad(value.getUTCSeconds());
  return `${hh}:${mm}:${ss}`;
}

function dateTimeLocalLiteral(value) {
  const yyyy = value.getFullYear();
  const mm = pad(value.getMonth() + 1);
  const dd = pad(value.getDate());
  const hh = pad(value.getHours());
  const mi = pad(value.getMinutes());
  const ss = pad(value.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function sqlLiteral(value, column) {
  if (value === null || value === undefined) return "NULL";

  const type = String(column.type_name || "").toLowerCase();

  if (type === "bit") {
    return value ? "1" : "0";
  }

  if ([
    "int",
    "bigint",
    "smallint",
    "tinyint",
    "decimal",
    "numeric",
    "float",
    "real",
    "money",
    "smallmoney",
  ].includes(type)) {
    return String(value);
  }

  if (type === "date") {
    const literal = value instanceof Date ? dateUtcLiteral(value) : String(value);
    return `CAST(N'${escapeSqlString(literal)}' AS date)`;
  }

  if (type === "time") {
    const literal = value instanceof Date ? timeUtcLiteral(value) : String(value);
    return `CAST(N'${escapeSqlString(literal)}' AS time)`;
  }

  if (["datetime", "datetime2", "smalldatetime", "datetimeoffset"].includes(type)) {
    const literal = value instanceof Date ? dateTimeLocalLiteral(value) : String(value);
    return `CAST(N'${escapeSqlString(literal)}' AS ${type})`;
  }

  if (type === "uniqueidentifier") {
    return `'${escapeSqlString(value)}'`;
  }

  if (Buffer.isBuffer(value)) {
    return `0x${value.toString("hex")}`;
  }

  if (type === "binary" || type === "varbinary" || type === "image") {
    return `0x${Buffer.from(value).toString("hex")}`;
  }

  if (["varchar", "char", "text"].includes(type)) {
    return `'${escapeSqlString(value)}'`;
  }

  return `N'${escapeSqlString(value)}'`;
}

async function getColumns(table) {
  const result = await db.execute(`
    SELECT
      c.column_id,
      c.name AS column_name,
      ty.name AS type_name,
      c.is_identity,
      CASE WHEN pk.column_id IS NULL THEN 0 ELSE 1 END AS is_primary_key
    FROM sys.columns c
    INNER JOIN sys.tables tb ON tb.object_id = c.object_id
    INNER JOIN sys.schemas s ON s.schema_id = tb.schema_id
    INNER JOIN sys.types ty ON ty.user_type_id = c.user_type_id
    LEFT JOIN (
      SELECT ic.object_id, ic.column_id
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic
        ON ic.object_id = i.object_id
       AND ic.index_id = i.index_id
      WHERE i.is_primary_key = 1
    ) pk
      ON pk.object_id = c.object_id
     AND pk.column_id = c.column_id
    WHERE s.name = N'dbo'
      AND tb.name = @table
    ORDER BY c.column_id;
  `, { table });

  return result.recordset || [];
}

function parseCreateColumns(script, table) {
  const re = new RegExp(`CREATE TABLE dbo\\.\\[${escapeRegExp(table)}\\] \\(([^]*?)\\n\\);`, "i");
  const match = script.match(re);
  if (!match) {
    throw new Error(`Could not locate CREATE TABLE block for dbo.[${table}] in create script`);
  }

  return match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("["))
    .map((line) => line.match(/^\[([^\]]+)\]/)?.[1])
    .filter(Boolean);
}

function orderByClause(columns) {
  const primaryKeys = columns.filter((column) => column.is_primary_key);
  if (primaryKeys.length) {
    return primaryKeys.map((column) => `[${column.column_name}] ASC`).join(", ");
  }

  const identity = columns.find((column) => column.is_identity);
  if (identity) {
    return `[${identity.column_name}] ASC`;
  }

  const first = columns[0];
  return first ? `[${first.column_name}] ASC` : "";
}

async function getRows(table, columns) {
  const orderBy = orderByClause(columns);
  const result = await db.execute(`
    SELECT *
    FROM dbo.[${table}]
    ${orderBy ? `ORDER BY ${orderBy}` : ""};
  `);

  return result.recordset || [];
}

function renderDeleteBlock() {
  return DELETE_ORDER.map((table) => `DELETE FROM dbo.[${table}];`).join("\n");
}

function renderInsertBlock(table, columns, rows) {
  if (!rows.length) return `-- dbo.[${table}] has no rows to import.\n`;

  const columnList = columns.map((column) => `[${column.column_name}]`).join(", ");
  const valueLines = rows.map((row) => {
    const values = columns.map((column) => sqlLiteral(row[column.column_name], column)).join(", ");
    return `  (${values})`;
  });

  const hasIdentity = columns.some((column) => column.is_identity);
  const chunks = [];

  if (hasIdentity) {
    chunks.push(`SET IDENTITY_INSERT dbo.[${table}] ON;`);
  }

  chunks.push(`INSERT INTO dbo.[${table}] (${columnList})`);
  chunks.push("VALUES");
  chunks.push(`${valueLines.join(",\n")};`);

  if (hasIdentity) {
    const identityColumn = columns.find((column) => column.is_identity);
    const maxIdentity = rows.reduce((max, row) => Math.max(max, Number(row[identityColumn.column_name] || 0)), 0);
    chunks.push(`SET IDENTITY_INSERT dbo.[${table}] OFF;`);
    chunks.push(`DBCC CHECKIDENT (N'dbo.[${table}]', RESEED, ${maxIdentity}) WITH NO_INFOMSGS;`);
  }

  return `${chunks.join("\n")}\n`;
}

async function main() {
  const exportMeta = timestampParts();
  const outputDir = join(process.cwd(), "database");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "import_employee_work_report_data.sql");
  const createScript = readFileSync(CREATE_SCRIPT_PATH, "utf8");

  const tableData = [];
  for (const table of TABLES) {
    const liveColumns = await getColumns(table);
    const targetColumnNames = parseCreateColumns(createScript, table);
    const columns = targetColumnNames.map((name) => {
      const liveColumn = liveColumns.find((column) => column.column_name === name);
      if (!liveColumn) {
        throw new Error(`Column dbo.[${table}].[${name}] exists in create script but not in source database`);
      }
      return liveColumn;
    });
    const rows = await getRows(table, columns);
    tableData.push({ table, columns, rows });
  }

  const counts = tableData.map(({ table, rows }) => `- ${table}: ${rows.length}`).join("\n");
  const insertBlocks = tableData
    .map(({ table, columns, rows }) => renderInsertBlock(table, columns, rows))
    .join("\n");

  const script = `/* =========================================================
   Employee Work Report System - data import snapshot
   Source version: 1.2.1
   Exported at: ${exportMeta.display}

   Run this AFTER:
   - database/create_employee_work_report_db.sql

   This script replaces all application data in the target DB
   with the exported data from the source environment.

   Export counts:
${counts}
   ========================================================= */

USE [employee_work_report];

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
  BEGIN TRANSACTION;

${renderDeleteBlock()}

${insertBlocks}
  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
`;

  writeFileSync(outputPath, `\uFEFF${script}`, "utf8");
  console.log(outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
