const express = require("express");
const router = express.Router();
const { generateToken } = require("../middlewares/authMiddleware");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * Auth Routes — token issuance for development / testing.
 *
 * In a production system, replace this with real user authentication
 * (database lookup + password verification).
 */

/**
 * POST /auth/token
 * Issues a JWT for use in authenticated requests.
 *
 * Body: { "clientId": "your-client-id", "secret": "your-secret" }
 *
 * Example curl:
 *   curl -X POST http://localhost:3000/auth/token \
 *     -H "Content-Type: application/json" \
 *     -d '{"clientId":"api-client","secret":"dev-secret"}'
 */
router.post("/token", (req, res) => {
  const { clientId, secret } = req.body;

  if (!clientId || !secret) {
    return errorResponse(res, "clientId and secret are required", 400);
  }

  // Development-only credential check — replace with DB lookup in production
  const DEV_CLIENT_ID = process.env.DEV_CLIENT_ID || "api-client";
  const DEV_SECRET    = process.env.DEV_SECRET    || "dev-secret";

  if (clientId !== DEV_CLIENT_ID || secret !== DEV_SECRET) {
    return errorResponse(res, "Invalid credentials", 401);
  }

  const token = generateToken({ clientId, role: "api-consumer" });
  return successResponse(res, { token }, "Token issued successfully");
});

module.exports = router;
