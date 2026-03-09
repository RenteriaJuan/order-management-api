/**
 * Maps the incoming request payload to the internal database schema.
 *
 * Transforms Portuguese/external field names to English/internal names:
 *   numeroPedido  → orderId
 *   valorTotal    → value
 *   dataCriacao   → creationDate
 *   items[].idItem         → productId (parsed as integer)
 *   items[].quantidadeItem → quantity
 *   items[].valorItem      → price
 *
 * @param {Object} requestBody - Raw JSON body from the POST/PUT request
 * @returns {Object} Mapped order object ready for database insertion
 */
function mapRequestToOrder(requestBody) {
  const { numeroPedido, valorTotal, dataCriacao, items = [] } = requestBody;

  return {
    orderId: numeroPedido,
    value: valorTotal,
    creationDate: new Date(dataCriacao).toISOString(),
    items: items.map((item) => ({
      productId: parseInt(item.idItem, 10),
      quantity: item.quantidadeItem,
      price: item.valorItem,
    })),
  };
}

/**
 * Maps a database row (and its items) to the API response shape.
 *
 * @param {Object} orderRow  - Row fetched from the [Order] table
 * @param {Array}  itemRows  - Rows fetched from the [Items] table for this order
 * @returns {Object} Clean order object for API responses
 */
function mapOrderToResponse(orderRow, itemRows = []) {
  return {
    orderId: orderRow.orderId,
    value: parseFloat(orderRow.value),
    creationDate: orderRow.creationDate,
    items: itemRows.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
  };
}

module.exports = { mapRequestToOrder, mapOrderToResponse };
