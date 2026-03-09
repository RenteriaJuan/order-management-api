require("dotenv").config();
const app = require("./app");
const { getConnection, closeConnection } = require("./config/database");

const PORT = process.env.PORT || 3000;

/**
 * Starts the HTTP server only after confirming the database is reachable.
 * Ensures the application never accepts requests without a DB connection.
 */
async function startServer() {
  try {
    // Validate database connectivity before accepting traffic
    await getConnection();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Order Management API running on http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await closeConnection();
        console.log("✅ Server and database connections closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
