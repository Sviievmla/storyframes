const { Pool } = require('pg');
const logger = require('./logger');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isConnectedFlag = false;

// Pool error handling
pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
  isConnectedFlag = false;
});

/**
 * Initialize database connection and create tables
 */
async function initialize() {
  try {
    // Test connection
    const client = await pool.connect();
    logger.info('Database connection established');
    client.release();
    
    isConnectedFlag = true;
    
    // Create tables if they don't exist
    await createTables();
    
    return true;
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    // Don't fail the app, continue without database
    isConnectedFlag = false;
    return false;
  }
}

/**
 * Create database tables
 */
async function createTables() {
  const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'EUR',
      status VARCHAR(50) NOT NULL,
      cart_items TEXT,
      customer_info TEXT,
      capture_data TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      captured_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  const refundsTable = `
    CREATE TABLE IF NOT EXISTS refunds (
      id SERIAL PRIMARY KEY,
      refund_id VARCHAR(255) UNIQUE NOT NULL,
      capture_id VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2),
      status VARCHAR(50) NOT NULL,
      refund_data TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  const indexOrders = `
    CREATE INDEX IF NOT EXISTS idx_orders_paypal_id ON orders(paypal_order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  `;
  
  const indexRefunds = `
    CREATE INDEX IF NOT EXISTS idx_refunds_refund_id ON refunds(refund_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_capture_id ON refunds(capture_id);
  `;

  try {
    await pool.query(ordersTable);
    await pool.query(refundsTable);
    await pool.query(indexOrders);
    await pool.query(indexRefunds);
    
    logger.info('Database tables created/verified successfully');
  } catch (error) {
    logger.error('Failed to create tables', { error: error.message });
    throw error;
  }
}

/**
 * Create a new order
 */
async function createOrder(orderData) {
  if (!isConnectedFlag) {
    logger.warn('Database not connected, skipping order creation');
    return null;
  }
  
  const query = `
    INSERT INTO orders (paypal_order_id, amount, currency, status, cart_items, customer_info, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [
    orderData.paypal_order_id,
    orderData.amount,
    orderData.currency || 'EUR',
    orderData.status,
    orderData.cart_items,
    orderData.customer_info,
    orderData.created_at || new Date()
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create order', { error: error.message });
    throw error;
  }
}

/**
 * Update order
 */
async function updateOrder(paypalOrderId, updates) {
  if (!isConnectedFlag) {
    logger.warn('Database not connected, skipping order update');
    return null;
  }
  
  const setClause = [];
  const values = [];
  let paramIndex = 1;
  
  if (updates.status) {
    setClause.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  
  if (updates.captured_at) {
    setClause.push(`captured_at = $${paramIndex++}`);
    values.push(updates.captured_at);
  }
  
  if (updates.capture_data) {
    setClause.push(`capture_data = $${paramIndex++}`);
    values.push(updates.capture_data);
  }
  
  setClause.push(`updated_at = $${paramIndex++}`);
  values.push(new Date());
  
  values.push(paypalOrderId);
  
  const query = `
    UPDATE orders 
    SET ${setClause.join(', ')}
    WHERE paypal_order_id = $${paramIndex}
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update order', { error: error.message });
    throw error;
  }
}

/**
 * Update order status
 */
async function updateOrderStatus(paypalOrderId, status) {
  return updateOrder(paypalOrderId, { status });
}

/**
 * Get order by PayPal order ID
 */
async function getOrderByPayPalId(paypalOrderId) {
  if (!isConnectedFlag) {
    return null;
  }
  
  const query = 'SELECT * FROM orders WHERE paypal_order_id = $1';
  
  try {
    const result = await pool.query(query, [paypalOrderId]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to get order', { error: error.message });
    throw error;
  }
}

/**
 * Get orders with pagination
 */
async function getOrders({ page = 1, limit = 50, status } = {}) {
  if (!isConnectedFlag) {
    return { orders: [], total: 0, page, limit };
  }
  
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM orders';
  let countQuery = 'SELECT COUNT(*) FROM orders';
  const values = [];
  let paramIndex = 1;
  
  if (status) {
    query += ` WHERE status = $${paramIndex}`;
    countQuery += ` WHERE status = $${paramIndex}`;
    values.push(status);
    paramIndex++;
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  
  try {
    const [ordersResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, status ? [status] : [])
    ]);
    
    return {
      orders: ordersResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  } catch (error) {
    logger.error('Failed to get orders', { error: error.message });
    throw error;
  }
}

/**
 * Create a refund record
 */
async function createRefund(refundData) {
  if (!isConnectedFlag) {
    logger.warn('Database not connected, skipping refund creation');
    return null;
  }
  
  const query = `
    INSERT INTO refunds (refund_id, capture_id, amount, status, refund_data, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    refundData.refund_id,
    refundData.capture_id,
    refundData.amount,
    refundData.status,
    refundData.refund_data,
    refundData.created_at || new Date()
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create refund', { error: error.message });
    throw error;
  }
}

/**
 * Update refund status
 */
async function updateRefundStatus(refundId, status) {
  if (!isConnectedFlag) {
    return null;
  }
  
  const query = `
    UPDATE refunds 
    SET status = $1, updated_at = $2
    WHERE refund_id = $3
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [status, new Date(), refundId]);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update refund status', { error: error.message });
    throw error;
  }
}

/**
 * Check if database is connected
 */
function isConnected() {
  return isConnectedFlag;
}

/**
 * Close database connection
 */
async function close() {
  try {
    await pool.end();
    isConnectedFlag = false;
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error: error.message });
  }
}

module.exports = {
  initialize,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getOrderByPayPalId,
  getOrders,
  createRefund,
  updateRefundStatus,
  isConnected,
  close
};
