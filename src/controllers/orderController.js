const { validationResult } = require("express-validator");
const orderService = require("../services/orderService");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * Controller layer — handles HTTP concerns only.
 * Delegates all logic to the service layer and returns appropriate HTTP responses.
 */

/**
 * POST /order
 * Creates a new order from the request body.
 */
async function createOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed", 400, errors.array());
  }

  try {
    const order = await orderService.createOrder(req.body);
    return successResponse(res, order, "Order created successfully", 201);
  } catch (error) {
    const status = error.status || 500;
    const message = status < 500 ? error.message : "An unexpected error occurred while creating the order";
    return errorResponse(res, message, status, error.message);
  }
}

/**
 * GET /order/:orderId
 * Returns a single order by its ID.
 */
async function getOrderById(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.orderId);
    return successResponse(res, order, "Order retrieved successfully");
  } catch (error) {
    const status = error.status || 500;
    const message = status < 500 ? error.message : "An unexpected error occurred while retrieving the order";
    return errorResponse(res, message, status, error.message);
  }
}

/**
 * GET /order/list
 * Returns all orders in the system.
 */
async function getAllOrders(req, res) {
  try {
    const orders = await orderService.getAllOrders();
    return successResponse(res, orders, `${orders.length} order(s) retrieved successfully`);
  } catch (error) {
    return errorResponse(res, "An unexpected error occurred while listing orders", 500, error.message);
  }
}

/**
 * PUT /order/:orderId
 * Fully replaces an existing order's data.
 */
async function updateOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed", 400, errors.array());
  }

  try {
    const order = await orderService.updateOrder(req.params.orderId, req.body);
    return successResponse(res, order, "Order updated successfully");
  } catch (error) {
    const status = error.status || 500;
    const message = status < 500 ? error.message : "An unexpected error occurred while updating the order";
    return errorResponse(res, message, status, error.message);
  }
}

/**
 * DELETE /order/:orderId
 * Permanently deletes an order and all its items.
 */
async function deleteOrder(req, res) {
  try {
    await orderService.deleteOrder(req.params.orderId);
    return successResponse(res, null, "Order deleted successfully");
  } catch (error) {
    const status = error.status || 500;
    const message = status < 500 ? error.message : "An unexpected error occurred while deleting the order";
    return errorResponse(res, message, status, error.message);
  }
}

module.exports = { createOrder, getOrderById, getAllOrders, updateOrder, deleteOrder };
