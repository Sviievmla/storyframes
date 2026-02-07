require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from the current directory

// Validate PayPal credentials
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('WARNING: PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file');
}

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 */
async function generateAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
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
    throw new Error(`PayPal OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Create an order to start the transaction.
 * POST /api/paypal/create-order
 */
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { cart, total } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }

    if (!total || isNaN(parseFloat(total))) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    const accessToken = await generateAccessToken();

    // Build items array for PayPal
    const items = cart.map(item => ({
      name: item.name,
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
          value: parseFloat(total).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: parseFloat(total).toFixed(2)
            }
          }
        },
        items: items
      }]
    };

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
      console.error('PayPal order creation error:', order);
      return res.status(response.status).json({ 
        error: 'Failed to create PayPal order',
        details: order 
      });
    }

    res.json({ orderID: order.id });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

/**
 * Capture payment for the created order.
 * POST /api/paypal/capture-order
 */
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const captureData = await response.json();

    if (!response.ok) {
      console.error('PayPal capture error:', captureData);
      return res.status(response.status).json({ 
        error: 'Failed to capture PayPal order',
        details: captureData 
      });
    }

    res.json(captureData);
  } catch (error) {
    console.error('Capture order error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    paypalConfigured: !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Story Frames Checkout Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💳 PayPal API: ${PAYPAL_API_BASE}`);
  console.log(`✅ PayPal credentials ${PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET ? 'configured' : 'NOT configured'}\n`);
});
