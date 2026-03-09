const sql = require("mssql");
require("dotenv").config();

/**
 * SQL Server connection configuration.
 * Supports both SQL Server authentication and Windows Authentication.
 * Set DB_TRUSTED_CONNECTION=true in .env to use Windows Authentication.
 */
const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || "OrderManagementDB",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
    enableArithAbort: true,
    // Windows Authentication — uses the current Windows session, no user/password needed
    trustedConnection: process.env.DB_TRUSTED_CONNECTION === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// Only add user/password when NOT using Windows Authentication
if (process.env.DB_TRUSTED_CONNECTION !== "true") {
  dbConfig.user     = process.env.DB_USER;
  dbConfig.password = process.env.DB_PASSWORD;
}

/** Singleton connection pool instance */
let pool = null;

/**
 * Initializes and returns the SQL Server connection pool.
 * Reuses the existing pool if already connected.
 * @returns {Promise<sql.ConnectionPool>} Active connection pool
 */
async function getConnection() {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log("✅ Connected to SQL Server successfully");
    return pool;
  } catch (error) {
    console.error("❌ SQL Server connection failed:", error.message);
    throw new Error(`Database connection error: ${error.message}`);
  }
}

/**
 * Gracefully closes the database connection pool.
 */
async function closeConnection() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("🔌 Database connection closed");
  }
}

module.exports = { getConnection, closeConnection, sql };