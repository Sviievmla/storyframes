require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Story Frames <noreply@storyframes.com>';
const EMAIL_TO = process.env.EMAIL_TO || 'Sviievmla@gmail.com';

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
// Note: .gitignore excludes sensitive files like .env and node_modules
app.use(express.static('.')); 

// Validate PayPal credentials
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('WARNING: PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file');
}

// Create email transporter (configured but may not be required for all deployments)
let emailTransporter = null;
if (EMAIL_HOST && EMAIL_USER && EMAIL_PASSWORD) {
  emailTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
  console.log('Email notifications enabled');
} else {
  console.warn('WARNING: Email configuration incomplete. Email notifications will be disabled.');
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
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(orderDetails, customerInfo, cartItems) {
  if (!emailTransporter) {
    console.log('Email not configured. Skipping email notification.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    // Format cart items for email
    const itemsList = cartItems.map(item => 
      `${item.name} × ${item.quantity || 1} - €${(item.price * (item.quantity || 1)).toFixed(2)}`
    ).join('\n');
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const emailBody = `
Order Confirmation - Story Frames

Transaction ID: ${orderDetails.id}
Status: ${orderDetails.status}

Customer Details:
Name: ${customerInfo.fullName}
Email: ${customerInfo.email}
Phone: ${customerInfo.phone}
Address: ${customerInfo.address}, ${customerInfo.city}
Postal Code: ${customerInfo.postalCode || 'N/A'}
Country: ${customerInfo.country}

Items Ordered:
${itemsList}

Total Paid: €${total.toFixed(2)}

Order Notes:
${customerInfo.notes || 'None'}

Thank you for your order!
Please send your photos to complete the order.

---
Story Frames
https://storyframes.bg
    `.trim();

    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      cc: customerInfo.email, // Send a copy to the customer
      subject: `Story Frames Order Confirmation - ${orderDetails.id}`,
      text: emailBody
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
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
    const { orderID, customerInfo, cart } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Validate customer info
    if (customerInfo) {
      const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'country'];
      const missingFields = requiredFields.filter(field => !customerInfo[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required customer information', 
          missingFields 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
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

    // Send order confirmation email if customer info and cart are provided
    if (customerInfo && cart && Array.isArray(cart)) {
      const emailResult = await sendOrderConfirmationEmail(captureData, customerInfo, cart);
      captureData.emailSent = emailResult.success;
      if (!emailResult.success) {
        console.warn('Email notification failed but order was captured successfully');
      }
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
  if (process.env.NODE_ENV !== 'production') {
    console.log(`💳 PayPal API: ${PAYPAL_API_BASE}`);
    console.log(`✅ PayPal credentials ${PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET ? 'configured' : 'NOT configured'}`);
  }
  console.log();
});
