require('dotenv').config();
const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// PayPal SDK Configuration
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: process.env.PAYPAL_MODE || 'sandbox',
    timestamp: new Date().toISOString()
  });
});

// Create PayPal Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { cart, customer } = req.body;

    // Validate request
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is required and must contain items' });
    }

    if (!customer || !customer.email || !customer.name) {
      return res.status(400).json({ error: 'Customer information is required' });
    }

    // Calculate total from cart items
    const totalAmount = cart.reduce((sum, item) => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0).toFixed(2);

    // Validate total
    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid cart total' });
    }

    // Build PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: totalAmount,
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: totalAmount
            }
          }
        },
        items: cart.map(item => ({
          name: item.name,
          description: item.description || item.name,
          unit_amount: {
            currency_code: 'EUR',
            value: parseFloat(item.price).toFixed(2)
          },
          quantity: String(item.quantity || 1)
        })),
        shipping: {
          name: {
            full_name: customer.name
          },
          address: {
            address_line_1: customer.address,
            admin_area_2: customer.city,
            postal_code: customer.postalCode || '',
            country_code: customer.countryCode || 'BG'
          }
        }
      }],
      application_context: {
        brand_name: 'Story Frames',
        locale: 'en-US',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/checkout.html?status=success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout.html?status=cancelled`
      }
    });

    // Execute PayPal order creation
    const client = getPayPalClient();
    const order = await client.execute(request);

    console.log('Order created:', order.result.id);

    res.json({
      orderID: order.result.id
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

// Capture PayPal Order
app.post('/api/capture-order', async (req, res) => {
  try {
    const { orderID, customer } = req.body;

    // Validate request
    if (!orderID) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const client = getPayPalClient();
    const capture = await client.execute(request);

    console.log('Order captured:', capture.result.id);
    console.log('Status:', capture.result.status);

    // Return capture result
    res.json({
      orderID: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer,
      purchase_units: capture.result.purchase_units
    });

  } catch (error) {
    console.error('Error capturing order:', error);
    res.status(500).json({ 
      error: 'Failed to capture order',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Story Frames Backend Server running on port ${PORT}`);
  console.log(`PayPal Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
  console.log(`CORS Enabled for: ${process.env.FRONTEND_URL || 'all origins'}`);
});
