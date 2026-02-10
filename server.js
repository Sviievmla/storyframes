require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// Import modules
const logger = require('./utils/logger');
const database = require('./utils/database');
const emailService = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 10000; // Default for local development, Render sets PORT via env

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Security: Helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://www.paypal.com"],
      connectSrc: ["'self'", "https://www.paypal.com", "https://api-m.paypal.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration - Production ready
const allowedOrigins = [
  'https://mystoryframes.shop',
  'https://www.mystoryframes.shop',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !IS_PRODUCTION) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for payment endpoints
  message: 'Too many payment requests, please try again later.'
});

app.use('/api/', limiter);

// Serve static files only in development
// SECURITY: This is disabled in production (NODE_ENV=production) to prevent exposure of sensitive files
// CodeQL Alert: Acknowledged - Static file serving is intentionally limited to development only
// Production deployment on Render will have NODE_ENV=production, disabling this feature
if (!IS_PRODUCTION) {
  app.use(express.static('.'));
  logger.warn('Static file serving enabled (development mode only)');
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Validate PayPal credentials
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  logger.error('CRITICAL: PayPal credentials not configured');
  if (IS_PRODUCTION) {
    process.exit(1); // Fail fast in production
  }
}

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 */
async function generateAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      logger.error('PayPal OAuth error', { error: data });
      throw new Error(`PayPal OAuth error: ${data.error_description || data.error}`);
    }

    return data.access_token;
  } catch (error) {
    logger.error('Failed to generate PayPal access token', { error: error.message });
    throw error;
  }
}

/**
 * Verify PayPal webhook signature for security
 * 
 * SECURITY NOTE: This is a basic implementation that should be enhanced for production.
 * For full webhook security, implement PayPal signature verification using their SDK
 * or manually verify the signature against PayPal's certificate.
 * 
 * See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#link-verifysignature
 */
function verifyWebhookSignature(req) {
  if (!PAYPAL_WEBHOOK_ID) {
    logger.warn('Webhook verification skipped - PAYPAL_WEBHOOK_ID not configured');
    logger.warn('SECURITY WARNING: Webhook requests are not being verified');
    return true; // Skip verification if not configured (NOT RECOMMENDED for production)
  }

  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const transmissionSig = req.headers['paypal-transmission-sig'];
  const certUrl = req.headers['paypal-cert-url'];
  const authAlgo = req.headers['paypal-auth-algo'];
  
  if (!transmissionId || !transmissionTime || !transmissionSig) {
    logger.warn('Webhook missing required signature headers');
    return false;
  }

  // TODO: Implement full signature verification
  // For production, use PayPal SDK or verify signature manually:
  // 1. Get cert from certUrl
  // 2. Build verification string (webhook_id|transmission_time|transmission_id|crc32(body))
  // 3. Verify signature using public key from cert
  
  logger.warn('SECURITY WARNING: Webhook signature verification not fully implemented');
  return true; // TEMPORARY - implement proper verification before production use
}

/**
 * Create an order to start the transaction.
 * POST /api/paypal/create-order
 */
app.post('/api/paypal/create-order', 
  strictLimiter,
  [
    body('cart').isArray({ min: 1 }).withMessage('Cart must be a non-empty array'),
    body('total').isFloat({ min: 0.01 }).withMessage('Total must be a positive number'),
    body('cart.*.name').trim().notEmpty().withMessage('Item name is required'),
    body('cart.*.price').isFloat({ min: 0 }).withMessage('Item price must be valid'),
    body('cart.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be positive'),
  ],
  async (req, res) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Create order validation failed', { errors: errors.array() });
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const { cart, total, customerInfo } = req.body;
      
      // Sanitize inputs
      const sanitizedTotal = parseFloat(total).toFixed(2);

      const accessToken = await generateAccessToken();

      // Build items array for PayPal
      const items = cart.map(item => ({
        name: String(item.name).substring(0, 127), // PayPal limit
        unit_amount: {
          currency_code: 'EUR',
          value: parseFloat(item.price).toFixed(2)
        },
        quantity: String(item.quantity || 1)
      }));

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          description: 'Story Frames Order',
          amount: {
            currency_code: 'EUR',
            value: sanitizedTotal,
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: sanitizedTotal
              }
            }
          },
          items: items
        }]
      };

      logger.info('Creating PayPal order', { total: sanitizedTotal, itemCount: items.length });

      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(orderData)
      });

      const order = await response.json();

      if (!response.ok) {
        logger.error('PayPal order creation failed', { 
          status: response.status, 
          error: order 
        });
        return res.status(response.status).json({ 
          error: 'Failed to create PayPal order',
          details: IS_PRODUCTION ? 'Payment processing error' : order
        });
      }

      // Store order in database
      try {
        await database.createOrder({
          paypal_order_id: order.id,
          amount: sanitizedTotal,
          currency: 'EUR',
          status: 'CREATED',
          cart_items: JSON.stringify(cart),
          customer_info: customerInfo ? JSON.stringify(customerInfo) : null,
          created_at: new Date()
        });
        logger.info('Order saved to database', { orderId: order.id });
      } catch (dbError) {
        logger.error('Failed to save order to database', { error: dbError.message });
        // Don't fail the request, order is created in PayPal
      }

      logger.info('PayPal order created successfully', { orderId: order.id });
      res.json({ orderID: order.id });
      
    } catch (error) {
      logger.error('Create order error', { error: error.message, stack: error.stack });
      res.status(500).json({ 
        error: 'Internal server error', 
        message: IS_PRODUCTION ? 'Payment processing error' : error.message 
      });
    }
  }
);

/**
 * Capture payment for the created order.
 * POST /api/paypal/capture-order
 */
app.post('/api/paypal/capture-order',
  strictLimiter,
  [
    body('orderID').trim().notEmpty().withMessage('Order ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const { orderID } = req.body;

      const accessToken = await generateAccessToken();

      logger.info('Capturing PayPal order', { orderId: orderID });

      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const captureData = await response.json();

      if (!response.ok) {
        logger.error('PayPal capture failed', { 
          orderId: orderID, 
          status: response.status, 
          error: captureData 
        });
        
        // Update order status in database
        try {
          await database.updateOrderStatus(orderID, 'FAILED');
        } catch (dbError) {
          logger.error('Failed to update order status', { error: dbError.message });
        }

        return res.status(response.status).json({ 
          error: 'Failed to capture PayPal order',
          details: IS_PRODUCTION ? 'Payment capture failed' : captureData
        });
      }

      // Update order in database
      try {
        await database.updateOrder(orderID, {
          status: captureData.status,
          captured_at: new Date(),
          capture_data: JSON.stringify(captureData)
        });
        
        // Get order details for email
        const orderDetails = await database.getOrderByPayPalId(orderID);
        
        // Send email notifications
        if (orderDetails && captureData.status === 'COMPLETED') {
          try {
            const emailData = {
              orderId: orderID,
              amount: orderDetails.amount,
              currency: orderDetails.currency,
              items: JSON.parse(orderDetails.cart_items || '[]'),
              customerInfo: orderDetails.customer_info ? JSON.parse(orderDetails.customer_info) : {}
            };
            
            await emailService.sendOrderConfirmation(emailData);
            await emailService.sendAdminNotification(emailData);
            
            logger.info('Order confirmation emails sent', { orderId: orderID });
          } catch (emailError) {
            logger.error('Failed to send confirmation emails', { 
              orderId: orderID, 
              error: emailError.message 
            });
            // Don't fail the request
          }
        }
      } catch (dbError) {
        logger.error('Failed to update captured order', { error: dbError.message });
        // Don't fail the request, capture succeeded
      }

      logger.info('Order captured successfully', { 
        orderId: orderID, 
        status: captureData.status 
      });

      res.json(captureData);
      
    } catch (error) {
      logger.error('Capture order error', { error: error.message, stack: error.stack });
      res.status(500).json({ 
        error: 'Internal server error', 
        message: IS_PRODUCTION ? 'Payment capture error' : error.message 
      });
    }
  }
);

/**
 * Process refund for an order
 * POST /api/paypal/refund
 */
app.post('/api/paypal/refund',
  strictLimiter,
  [
    body('captureId').trim().notEmpty().withMessage('Capture ID is required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const { captureId, amount, note } = req.body;
      const accessToken = await generateAccessToken();

      const refundData = {
        note_to_payer: note || 'Refund for your order'
      };

      if (amount) {
        refundData.amount = {
          currency_code: 'EUR',
          value: parseFloat(amount).toFixed(2)
        };
      }

      logger.info('Processing refund', { captureId, amount });

      const response = await fetch(
        `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(refundData)
        }
      );

      const refundResult = await response.json();

      if (!response.ok) {
        logger.error('PayPal refund failed', { captureId, error: refundResult });
        return res.status(response.status).json({
          error: 'Failed to process refund',
          details: IS_PRODUCTION ? 'Refund processing error' : refundResult
        });
      }

      // Store refund in database
      try {
        await database.createRefund({
          refund_id: refundResult.id,
          capture_id: captureId,
          amount: amount || null,
          status: refundResult.status,
          refund_data: JSON.stringify(refundResult),
          created_at: new Date()
        });
      } catch (dbError) {
        logger.error('Failed to save refund to database', { error: dbError.message });
      }

      logger.info('Refund processed successfully', { 
        refundId: refundResult.id, 
        status: refundResult.status 
      });

      res.json(refundResult);
      
    } catch (error) {
      logger.error('Refund error', { error: error.message, stack: error.stack });
      res.status(500).json({
        error: 'Internal server error',
        message: IS_PRODUCTION ? 'Refund processing error' : error.message
      });
    }
  }
);

/**
 * PayPal Webhook handler for IPN (Instant Payment Notification)
 * POST /api/paypal/webhook
 */
app.post('/api/paypal/webhook', async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      logger.warn('Webhook signature verification failed', {
        headers: req.headers
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const event = req.body;
    logger.info('PayPal webhook received', { 
      eventType: event.event_type,
      resourceId: event.resource?.id 
    });

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(event);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentCaptureDenied(event);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentCaptureRefunded(event);
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event);
        break;
      default:
        logger.info('Unhandled webhook event type', { eventType: event.event_type });
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    logger.error('Webhook processing error', { error: error.message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook event handlers
async function handlePaymentCaptureCompleted(event) {
  const captureId = event.resource.id;
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;
  
  logger.info('Payment capture completed', { captureId, orderId });
  
  try {
    if (orderId) {
      await database.updateOrderStatus(orderId, 'COMPLETED');
    }
  } catch (error) {
    logger.error('Failed to update order status from webhook', { error: error.message });
  }
}

async function handlePaymentCaptureDenied(event) {
  const captureId = event.resource.id;
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;
  
  logger.warn('Payment capture denied', { captureId, orderId });
  
  try {
    if (orderId) {
      await database.updateOrderStatus(orderId, 'DENIED');
      
      // Send failure notification email
      const orderDetails = await database.getOrderByPayPalId(orderId);
      if (orderDetails) {
        await emailService.sendPaymentFailedNotification({
          orderId,
          reason: 'Payment denied'
        });
      }
    }
  } catch (error) {
    logger.error('Failed to handle denied payment', { error: error.message });
  }
}

async function handlePaymentCaptureRefunded(event) {
  const refundId = event.resource.id;
  const captureId = event.resource.supplementary_data?.related_ids?.capture_id;
  
  logger.info('Payment refunded', { refundId, captureId });
  
  try {
    await database.updateRefundStatus(refundId, 'COMPLETED');
  } catch (error) {
    logger.error('Failed to update refund status', { error: error.message });
  }
}

async function handleOrderApproved(event) {
  const orderId = event.resource.id;
  
  logger.info('Order approved', { orderId });
  
  try {
    await database.updateOrderStatus(orderId, 'APPROVED');
  } catch (error) {
    logger.error('Failed to update order to approved', { error: error.message });
  }
}

/**
 * Get all orders (admin endpoint)
 * GET /api/orders
 */
app.get('/api/orders', limiter, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    const orders = await database.getOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    res.json(orders);
  } catch (error) {
    logger.error('Failed to fetch orders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * Get specific order by ID
 * GET /api/orders/:id
 */
app.get('/api/orders/:id', limiter, async (req, res) => {
  try {
    const order = await database.getOrderByPayPalId(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    logger.error('Failed to fetch order', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    paypalConfigured: !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET),
    databaseConnected: database.isConnected(),
    emailConfigured: emailService.isConfigured()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Story Frames Checkout API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      createOrder: 'POST /api/paypal/create-order',
      captureOrder: 'POST /api/paypal/capture-order',
      refund: 'POST /api/paypal/refund',
      webhook: 'POST /api/paypal/webhook',
      orders: 'GET /api/orders',
      orderById: 'GET /api/orders/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path 
  });
  
  res.status(err.status || 500).json({
    error: IS_PRODUCTION ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await database.close();
  
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await database.initialize();
    logger.info('Database connected successfully');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Story Frames Checkout Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`💳 PayPal API: ${PAYPAL_API_BASE}`);
      logger.info(`✅ PayPal credentials ${PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET ? 'configured' : 'NOT configured'}`);
      logger.info(`📧 Email service ${emailService.isConfigured() ? 'configured' : 'NOT configured'}`);
      logger.info(`🗄️  Database ${database.isConnected() ? 'connected' : 'NOT connected'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();
