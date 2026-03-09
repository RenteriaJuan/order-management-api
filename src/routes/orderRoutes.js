const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { validateCreateOrder, validateUpdateOrder } = require("../middlewares/orderValidator");
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * Order Routes
 *
 * All routes are protected by JWT authentication.
 * Remove the `authenticate` middleware if authentication is not required.
 *
 * NOTE: /order/list MUST be declared before /order/:orderId to prevent
 * Express from matching "list" as a dynamic :orderId parameter.
 */

// GET /order/list — retrieve all orders
router.get("/list", authenticate, orderController.getAllOrders);

// GET /order/:orderId — retrieve a single order by ID
router.get("/:orderId", authenticate, orderController.getOrderById);

// POST /order — create a new order
router.post("/", authenticate, validateCreateOrder, orderController.createOrder);

// PUT /order/:orderId — update an existing order
router.put("/:orderId", authenticate, validateUpdateOrder, orderController.updateOrder);

// DELETE /order/:orderId — delete an order
router.delete("/:orderId", authenticate, orderController.deleteOrder);

module.exports = router;
