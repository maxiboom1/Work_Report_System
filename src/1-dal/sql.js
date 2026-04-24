import sql from "mssql";
import appConfig from "../3-utilities/app-config.js";
import logger from "../3-utilities/logger.js";

const config = {
  user: appConfig.sqlServerUser,
  password: appConfig.sqlServerPassword,
  server: appConfig.sqlServerHost,
  database: appConfig.sqlServerDatabase,
  options: {
    encrypt: false, // for Azure users
    trustServerCertificate: true, // change to false for production environments
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    logger(`[SYSTEM] SQL Client connected to ${config.database} database`);
    return pool;
  })
  .catch((err) => {
    logger(`[SYSTEM] Error connecting to SQL Server: ${err}`, "red");
    throw err;
  });

function bindInputs(request, values) {
  if (!values || typeof values !== "object") return;

  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      request.input(key, values[key]);
    }
  }
}

async function executeWithRequestFactory(makeRequest, query, values) {
  try {
    const request = await makeRequest();
    bindInputs(request, values);
    const result = await request.query(query);
    return result;
  } catch (err) {
    logger(`[SQL EXECUTER] Error executing query: ${err}`, "red");
    throw err;
  }
}

async function execute(query, values) {
  return executeWithRequestFactory(async () => {
    const pool = await poolPromise;
    return pool.request();
  }, query, values);
}

async function executeTransaction(run) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  const txExecute = async (query, values) => executeWithRequestFactory(
    async () => new sql.Request(transaction),
    query,
    values
  );

  try {
    const result = await run(txExecute);
    await transaction.commit();
    return result;
  } catch (err) {
    try {
      if (!transaction._aborted) await transaction.rollback();
    } catch (rollbackErr) {
      logger(`[SQL EXECUTER] Error rolling back transaction: ${rollbackErr}`, "red");
    }
    throw err;
  }
}

export default {
  execute,
  executeTransaction,
};
