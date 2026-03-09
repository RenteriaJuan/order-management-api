const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHelper");

/**
 * Express middleware that validates a Bearer JWT token.
 *
 * Attach this middleware to any route that requires authentication:
 *   router.get("/protected", authenticate, controller.handler)
 *
 * The decoded payload is attached to `req.user` for downstream use.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authorization token is missing or malformed", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Authorization token has expired", 401);
    }
    return errorResponse(res, "Authorization token is invalid", 401);
  }
}

/**
 * Generates a signed JWT for a given payload.
 * Used by the /auth/token endpoint.
 *
 * @param {Object} payload - Data to encode inside the token
 * @returns {string} Signed JWT string
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
}

module.exports = { authenticate, generateToken };
