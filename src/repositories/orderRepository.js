const { getConnection, sql } = require("../config/database");

/**
 * Repository layer — all direct SQL Server interactions for orders.
 * No business logic lives here; only raw data access.
 */

/**
 * Persists a new order and its items inside a single transaction.
 * Rolls back automatically if any INSERT fails.
 *
 * @param {Object} order - Mapped order object { orderId, value, creationDate, items[] }
 * @returns {string} The orderId of the created order
 */
async function createOrder(order) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Insert the parent Order record
    await request
      .input("orderId", sql.NVarChar(100), order.orderId)
      .input("value", sql.Decimal(18, 2), order.value)
      .input("creationDate", sql.DateTime2, new Date(order.creationDate))
      .query(`
        INSERT INTO [Order] (orderId, value, creationDate)
        VALUES (@orderId, @value, @creationDate)
      `);

    // Insert each child Item record
    for (const item of order.items) {
      const itemRequest = new sql.Request(transaction);
      await itemRequest
        .input("orderId", sql.NVarChar(100), order.orderId)
        .input("productId", sql.Int, item.productId)
        .input("quantity", sql.Int, item.quantity)
        .input("price", sql.Decimal(18, 2), item.price)
        .query(`
          INSERT INTO [Items] (orderId, productId, quantity, price)
          VALUES (@orderId, @productId, @quantity, @price)
        `);
    }

    await transaction.commit();
    return order.orderId;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Retrieves a single order along with all its items.
 *
 * @param {string} orderId - The order identifier to look up
 * @returns {{ order: Object|null, items: Array }} Order row and item rows (empty arrays if not found)
 */
async function findOrderById(orderId) {
  const pool = await getConnection();

  const orderResult = await pool
    .request()
    .input("orderId", sql.NVarChar(100), orderId)
    .query("SELECT * FROM [Order] WHERE orderId = @orderId");

  if (!orderResult.recordset.length) {
    return { order: null, items: [] };
  }

  const itemsResult = await pool
    .request()
    .input("orderId", sql.NVarChar(100), orderId)
    .query("SELECT * FROM [Items] WHERE orderId = @orderId");

  return {
    order: orderResult.recordset[0],
    items: itemsResult.recordset,
  };
}

/**
 * Retrieves every order and its items.
 * Items are nested inside each order object before returning.
 *
 * @returns {Array} Array of order objects with embedded items arrays
 */
async function findAllOrders() {
  const pool = await getConnection();

  const ordersResult = await pool
    .request()
    .query("SELECT * FROM [Order] ORDER BY creationDate DESC");

  const itemsResult = await pool
    .request()
    .query("SELECT * FROM [Items]");

  // Group items by orderId for efficient lookup
  const itemsByOrder = itemsResult.recordset.reduce((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {});

  return ordersResult.recordset.map((order) => ({
    order,
    items: itemsByOrder[order.orderId] || [],
  }));
}

/**
 * Updates an existing order's scalar fields and replaces all its items.
 * Uses a transaction so the item replacement is atomic.
 *
 * @param {string} orderId     - Identifier of the order to update
 * @param {Object} orderData   - New values { value, creationDate, items[] }
 * @returns {boolean} True if a row was updated, false if the order was not found
 */
async function updateOrder(orderId, orderData) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Update Order scalar fields
    const updateRequest = new sql.Request(transaction);
    const result = await updateRequest
      .input("orderId", sql.NVarChar(100), orderId)
      .input("value", sql.Decimal(18, 2), orderData.value)
      .input("creationDate", sql.DateTime2, new Date(orderData.creationDate))
      .input("updatedAt", sql.DateTime2, new Date())
      .query(`
        UPDATE [Order]
        SET value = @value, creationDate = @creationDate, updatedAt = @updatedAt
        WHERE orderId = @orderId
      `);

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return false;
    }

    // Replace all items for this order
    const deleteRequest = new sql.Request(transaction);
    await deleteRequest
      .input("orderId", sql.NVarChar(100), orderId)
      .query("DELETE FROM [Items] WHERE orderId = @orderId");

    for (const item of orderData.items) {
      const itemRequest = new sql.Request(transaction);
      await itemRequest
        .input("orderId", sql.NVarChar(100), orderId)
        .input("productId", sql.Int, item.productId)
        .input("quantity", sql.Int, item.quantity)
        .input("price", sql.Decimal(18, 2), item.price)
        .query(`
          INSERT INTO [Items] (orderId, productId, quantity, price)
          VALUES (@orderId, @productId, @quantity, @price)
        `);
    }

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Permanently removes an order (cascade deletes its items via FK constraint).
 *
 * @param {string} orderId - Identifier of the order to delete
 * @returns {boolean} True if a row was deleted, false if not found
 */
async function deleteOrder(orderId) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("orderId", sql.NVarChar(100), orderId)
    .query("DELETE FROM [Order] WHERE orderId = @orderId");

  return result.rowsAffected[0] > 0;
}

/**
 * Checks whether a given orderId already exists in the database.
 *
 * @param {string} orderId
 * @returns {boolean}
 */
async function orderExists(orderId) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("orderId", sql.NVarChar(100), orderId)
    .query("SELECT 1 FROM [Order] WHERE orderId = @orderId");

  return result.recordset.length > 0;
}

module.exports = {
  createOrder,
  findOrderById,
  findAllOrders,
  updateOrder,
  deleteOrder,
  orderExists,
};
