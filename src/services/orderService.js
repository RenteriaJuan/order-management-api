const orderRepository = require("../repositories/orderRepository");
const { mapRequestToOrder, mapOrderToResponse } = require("../utils/orderMapper");

/**
 * Service layer — orchestrates business rules between the controller
 * and the repository. Keeps controllers thin and repositories pure.
 */

/**
 * Creates a new order after validating that the orderId is unique.
 *
 * @param {Object} requestBody - Raw request payload
 * @returns {Object} The created order in response shape
 * @throws {Error} With status 409 if the orderId already exists
 */
async function createOrder(requestBody) {
  const mappedOrder = mapRequestToOrder(requestBody);

  const exists = await orderRepository.orderExists(mappedOrder.orderId);
  if (exists) {
    const error = new Error(`Order with ID "${mappedOrder.orderId}" already exists`);
    error.status = 409;
    throw error;
  }

  await orderRepository.createOrder(mappedOrder);

  const { order, items } = await orderRepository.findOrderById(mappedOrder.orderId);
  return mapOrderToResponse(order, items);
}

/**
 * Retrieves a single order by its ID.
 *
 * @param {string} orderId
 * @returns {Object} The order in response shape
 * @throws {Error} With status 404 if no order matches the ID
 */
async function getOrderById(orderId) {
  const { order, items } = await orderRepository.findOrderById(orderId);

  if (!order) {
    const error = new Error(`Order "${orderId}" not found`);
    error.status = 404;
    throw error;
  }

  return mapOrderToResponse(order, items);
}

/**
 * Returns all orders with their items.
 *
 * @returns {Array} Array of orders in response shape
 */
async function getAllOrders() {
  const results = await orderRepository.findAllOrders();
  return results.map(({ order, items }) => mapOrderToResponse(order, items));
}

/**
 * Updates an existing order. Accepts the same payload shape as creation.
 *
 * @param {string} orderId    - Target order identifier
 * @param {Object} requestBody - Raw request payload with updated values
 * @returns {Object} The updated order in response shape
 * @throws {Error} With status 404 if the order does not exist
 */
async function updateOrder(orderId, requestBody) {
  const mappedOrder = mapRequestToOrder({ ...requestBody, numeroPedido: orderId });

  const updated = await orderRepository.updateOrder(orderId, mappedOrder);
  if (!updated) {
    const error = new Error(`Order "${orderId}" not found`);
    error.status = 404;
    throw error;
  }

  const { order, items } = await orderRepository.findOrderById(orderId);
  return mapOrderToResponse(order, items);
}

/**
 * Permanently removes an order.
 *
 * @param {string} orderId
 * @throws {Error} With status 404 if the order does not exist
 */
async function deleteOrder(orderId) {
  const deleted = await orderRepository.deleteOrder(orderId);
  if (!deleted) {
    const error = new Error(`Order "${orderId}" not found`);
    error.status = 404;
    throw error;
  }
}

module.exports = { createOrder, getOrderById, getAllOrders, updateOrder, deleteOrder };
