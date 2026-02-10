const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@mystoryframes.shop';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Sviievmla@gmail.com';

let transporter = null;
let isConfiguredFlag = false;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
  if (!EMAIL_CONFIG.host || !EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    logger.warn('Email service not configured - missing SMTP credentials');
    isConfiguredFlag = false;
    return;
  }

  try {
    transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    isConfiguredFlag = true;
    logger.info('Email service configured successfully');
  } catch (error) {
    logger.error('Failed to configure email service', { error: error.message });
    isConfiguredFlag = false;
  }
}

// Initialize on load
initializeTransporter();

/**
 * Send order confirmation email to customer
 */
async function sendOrderConfirmation(orderData) {
  if (!isConfiguredFlag) {
    logger.warn('Email service not configured, skipping order confirmation');
    return false;
  }

  const { orderId, amount, currency, items, customerInfo } = orderData;
  
  const itemsList = items.map(item => 
    `- ${item.name} x ${item.quantity || 1} = ${parseFloat(item.price).toFixed(2)} ${currency}`
  ).join('\n');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .total { font-size: 18px; font-weight: bold; color: #4CAF50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${customerInfo.name || 'Customer'},</p>
          <p>Thank you for your order! Your payment has been successfully processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            
            <h4>Items:</h4>
            <pre>${itemsList}</pre>
            
            <p class="total">Total: ${parseFloat(amount).toFixed(2)} ${currency}</p>
          </div>
          
          <p>You will receive your digital products shortly. If you have any questions, please contact us at ${ADMIN_EMAIL}.</p>
          
          <p>Thank you for shopping with Story Frames!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Story Frames. All rights reserved.</p>
          <p>mystoryframes.shop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: customerInfo.email,
    subject: `Order Confirmation - ${orderId}`,
    html: emailHtml,
    text: `
Thank you for your order!

Order ID: ${orderId}
Date: ${new Date().toLocaleString()}

Items:
${itemsList}

Total: ${parseFloat(amount).toFixed(2)} ${currency}

Thank you for shopping with Story Frames!
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Order confirmation email sent', { 
      orderId, 
      email: customerInfo.email 
    });
    return true;
  } catch (error) {
    logger.error('Failed to send order confirmation email', { 
      orderId, 
      error: error.message 
    });
    return false;
  }
}

/**
 * Send admin notification email
 */
async function sendAdminNotification(orderData) {
  if (!isConfiguredFlag) {
    logger.warn('Email service not configured, skipping admin notification');
    return false;
  }

  const { orderId, amount, currency, items, customerInfo } = orderData;
  
  const itemsList = items.map(item => 
    `- ${item.name} x ${item.quantity || 1} = ${parseFloat(item.price).toFixed(2)} ${currency}`
  ).join('\n');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .total { font-size: 18px; font-weight: bold; color: #2196F3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Order Received!</h1>
        </div>
        <div class="content">
          <div class="order-details">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p class="total">Total: ${parseFloat(amount).toFixed(2)} ${currency}</p>
            
            <h4>Customer Information:</h4>
            <p><strong>Name:</strong> ${customerInfo.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${customerInfo.address || 'N/A'}</p>
            
            <h4>Items Ordered:</h4>
            <pre>${itemsList}</pre>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order: ${orderId} - ${parseFloat(amount).toFixed(2)} ${currency}`,
    html: emailHtml
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Admin notification email sent', { orderId });
    return true;
  } catch (error) {
    logger.error('Failed to send admin notification email', { 
      orderId, 
      error: error.message 
    });
    return false;
  }
}

/**
 * Send payment failed notification
 */
async function sendPaymentFailedNotification(data) {
  if (!isConfiguredFlag) {
    return false;
  }

  const { orderId, reason } = data;

  const mailOptions = {
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Payment Failed - ${orderId}`,
    html: `
      <h2>Payment Failed</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Payment failed notification sent', { orderId });
    return true;
  } catch (error) {
    logger.error('Failed to send payment failed notification', { 
      orderId, 
      error: error.message 
    });
    return false;
  }
}

/**
 * Check if email service is configured
 */
function isConfigured() {
  return isConfiguredFlag;
}

module.exports = {
  sendOrderConfirmation,
  sendAdminNotification,
  sendPaymentFailedNotification,
  isConfigured
};
