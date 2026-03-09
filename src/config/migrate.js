require("dotenv").config();
const { getConnection, sql, closeConnection } = require("./database");

/**
 * Migration script to create the required database tables.
 * Run once with: npm run migrate
 */
async function runMigrations() {
  let pool;

  try {
    pool = await getConnection();
    console.log("🔄 Running database migrations...");

    // Create Orders table
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sysobjects WHERE name='Order' AND xtype='U'
      )
      CREATE TABLE [Order] (
        orderId       NVARCHAR(100)   NOT NULL PRIMARY KEY,
        value         DECIMAL(18, 2)  NOT NULL,
        creationDate  DATETIME2       NOT NULL,
        createdAt     DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
        updatedAt     DATETIME2       NOT NULL DEFAULT GETUTCDATE()
      )
    `);
    console.log("✅ Table [Order] is ready");

    // Create Items table with foreign key to Order
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sysobjects WHERE name='Items' AND xtype='U'
      )
      CREATE TABLE [Items] (
        id          INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
        orderId     NVARCHAR(100)   NOT NULL,
        productId   INT             NOT NULL,
        quantity    INT             NOT NULL,
        price       DECIMAL(18, 2)  NOT NULL,
        CONSTRAINT FK_Items_Order FOREIGN KEY (orderId)
          REFERENCES [Order](orderId) ON DELETE CASCADE
      )
    `);
    console.log("✅ Table [Items] is ready");

    console.log("🎉 All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

runMigrations();
