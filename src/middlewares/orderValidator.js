const { body } = require("express-validator");

/**
 * Validation rules for order creation (POST /order).
 * Ensures all required fields are present and correctly typed.
 */
const validateCreateOrder = [
  body("numeroPedido")
    .notEmpty().withMessage("numeroPedido is required")
    .isString().withMessage("numeroPedido must be a string")
    .trim(),

  body("valorTotal")
    .notEmpty().withMessage("valorTotal is required")
    .isNumeric().withMessage("valorTotal must be a number")
    .isFloat({ min: 0 }).withMessage("valorTotal must be a non-negative number"),

  body("dataCriacao")
    .notEmpty().withMessage("dataCriacao is required")
    .isISO8601().withMessage("dataCriacao must be a valid ISO 8601 date"),

  body("items")
    .isArray({ min: 1 }).withMessage("items must be a non-empty array"),

  body("items.*.idItem")
    .notEmpty().withMessage("items[].idItem is required")
    .isString().withMessage("items[].idItem must be a string"),

  body("items.*.quantidadeItem")
    .notEmpty().withMessage("items[].quantidadeItem is required")
    .isInt({ min: 1 }).withMessage("items[].quantidadeItem must be a positive integer"),

  body("items.*.valorItem")
    .notEmpty().withMessage("items[].valorItem is required")
    .isNumeric().withMessage("items[].valorItem must be a number")
    .isFloat({ min: 0 }).withMessage("items[].valorItem must be a non-negative number"),
];

/**
 * Validation rules for order update (PUT /order/:orderId).
 * Same rules as creation, minus the numeroPedido field (taken from URL param).
 */
const validateUpdateOrder = [
  body("valorTotal")
    .notEmpty().withMessage("valorTotal is required")
    .isNumeric().withMessage("valorTotal must be a number")
    .isFloat({ min: 0 }).withMessage("valorTotal must be a non-negative number"),

  body("dataCriacao")
    .notEmpty().withMessage("dataCriacao is required")
    .isISO8601().withMessage("dataCriacao must be a valid ISO 8601 date"),

  body("items")
    .isArray({ min: 1 }).withMessage("items must be a non-empty array"),

  body("items.*.idItem")
    .notEmpty().withMessage("items[].idItem is required")
    .isString().withMessage("items[].idItem must be a string"),

  body("items.*.quantidadeItem")
    .notEmpty().withMessage("items[].quantidadeItem is required")
    .isInt({ min: 1 }).withMessage("items[].quantidadeItem must be a positive integer"),

  body("items.*.valorItem")
    .notEmpty().withMessage("items[].valorItem is required")
    .isNumeric().withMessage("items[].valorItem must be a number")
    .isFloat({ min: 0 }).withMessage("items[].valorItem must be a non-negative number"),
];

module.exports = { validateCreateOrder, validateUpdateOrder };
