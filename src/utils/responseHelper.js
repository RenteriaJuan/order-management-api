/**
 * Sends a standardized success response.
 *
 * @param {Object} res        - Express response object
 * @param {*}      data       - Payload to include in the response
 * @param {string} [message]  - Optional human-readable message
 * @param {number} [status]   - HTTP status code (default: 200)
 */
function successResponse(res, data, message = "Operation successful", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a standardized error response.
 *
 * @param {Object} res       - Express response object
 * @param {string} message   - Human-readable error description
 * @param {number} [status]  - HTTP status code (default: 500)
 * @param {*}      [details] - Optional debug details (omitted in production)
 */
function errorResponse(res, message, status = 500, details = null) {
  const body = { success: false, message };

  if (details && process.env.NODE_ENV !== "production") {
    body.details = details;
  }

  return res.status(status).json(body);
}

module.exports = { successResponse, errorResponse };
