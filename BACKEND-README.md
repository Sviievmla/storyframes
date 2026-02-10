# Story Frames Backend Server

## Overview

This is a unified Node.js/Express backend server that handles PayPal payment processing and email notifications for the Story Frames e-commerce platform.

## Features

### ✅ PayPal Integration
- **Create Orders**: Accepts cart items and total amount, creates PayPal orders
- **Capture Payments**: Captures approved payments and processes order completion
- **Proper Error Handling**: Comprehensive error messages for debugging
- **Input Validation**: Validates all inputs to prevent errors

### ✅ Email Notifications
- **Order Confirmation**: Automatically sends email confirmations after successful payment
- **Customer Copy**: Sends a copy of the order confirmation to the customer
- **Detailed Information**: Includes transaction ID, customer details, order items, and total

### ✅ Security & Best Practices
- **CORS Support**: Configured for cross-origin requests
- **Environment Variables**: Secure credential storage
- **Request Validation**: Sanitizes and validates all inputs
- **Error Logging**: Comprehensive error logging for troubleshooting

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and configuration information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T16:00:00.000Z",
  "paypalConfigured": true
}
```

### Create PayPal Order
```
POST /api/paypal/create-order
```

**Request Body:**
```json
{
  "cart": [
    {
      "name": "Premium Frame",
      "price": 29.99,
      "quantity": 1
    }
  ],
  "total": 29.99
}
```

**Response:**
```json
{
  "orderID": "5O190127TN364715T"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid cart or total
- `500 Internal Server Error`: PayPal API error or credentials not configured

### Capture PayPal Order
```
POST /api/paypal/capture-order
```

**Request Body:**
```json
{
  "orderID": "5O190127TN364715T",
  "customerInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+359123456789",
    "address": "123 Main Street",
    "city": "Sofia",
    "postalCode": "1000",
    "country": "Bulgaria",
    "notes": "Please handle with care"
  },
  "cart": [
    {
      "name": "Premium Frame",
      "price": 29.99,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "emailSent": true,
  ...
}
```

**Error Responses:**
- `400 Bad Request`: Missing orderID, invalid customer info, or invalid email
- `500 Internal Server Error`: PayPal capture error

## Installation

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn

### Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `node-fetch` - HTTP client for PayPal API
- `nodemailer` - Email sending

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# For production:
# PAYPAL_API_BASE=https://api-m.paypal.com

# Server Configuration
PORT=3000

# Email Configuration (for order notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Story Frames <noreply@yourdomain.com>
EMAIL_TO=orders@yourdomain.com
```

### Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a sandbox app for testing
3. Copy the Client ID and Secret
4. For production, create a live app and use those credentials

### Setting Up Email (Gmail Example)

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password (Security > 2-Step Verification > App passwords)
4. Use the generated password in `EMAIL_PASSWORD`

**Note**: Email configuration is optional. If not configured, the server will still work but won't send email notifications.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the configured PORT (default: 3000).

## Testing

### Manual Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Test create order (will fail without credentials):**
   ```bash
   curl -X POST http://localhost:3000/api/paypal/create-order \
     -H "Content-Type: application/json" \
     -d '{
       "cart": [{"name": "Test Product", "price": 10.99, "quantity": 1}],
       "total": 10.99
     }'
   ```

### Validation Testing

The server includes comprehensive input validation:

- **Empty cart**: Returns 400 error
- **Invalid total**: Returns 400 error
- **Missing orderID**: Returns 400 error
- **Invalid email format**: Returns 400 error
- **Missing required customer fields**: Returns 400 error with list of missing fields

## Integration with Frontend

The `checkout.html` file is already configured to work with this backend:

1. **API Base URL**: Set via `window.BACKEND_URL` or defaults to same origin
2. **Create Order**: Calls `/api/paypal/create-order` with cart and total
3. **Capture Order**: Calls `/api/paypal/capture-order` with orderID, customerInfo, and cart
4. **Error Handling**: Displays user-friendly error messages
5. **Success Handling**: Shows order confirmation modal

## Deployment

### Prerequisites
- Server with Node.js installed
- Valid PayPal credentials (sandbox for testing, live for production)
- (Optional) Email server credentials for notifications

### Deployment Steps

1. **Upload files to server**
2. **Install dependencies:**
   ```bash
   npm install --production
   ```
3. **Configure environment variables** in `.env` file
4. **Start the server:**
   ```bash
   npm start
   ```
5. **Set up process manager** (e.g., PM2) for automatic restarts:
   ```bash
   npm install -g pm2
   pm2 start server.js --name storyframes-backend
   pm2 save
   pm2 startup
   ```

### Popular Hosting Options

- **Heroku**: Easy deployment with free tier
- **DigitalOcean**: VPS with full control
- **AWS EC2**: Scalable cloud hosting
- **Render**: Modern platform with free tier
- **Railway**: Simple deployment platform

## Troubleshooting

### PayPal Credentials Not Configured
**Error**: `PayPal credentials not configured`

**Solution**: Add `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` to `.env` file

### Email Not Sending
**Warning**: `Email configuration incomplete`

**Solution**: 
1. Check all email-related environment variables are set
2. Verify your email provider allows SMTP access
3. For Gmail, use an App Password instead of your regular password
4. Check firewall/network allows outbound connections on port 587

### CORS Errors
**Error**: Cross-origin request blocked

**Solution**: The server already has CORS enabled. If you still see errors:
1. Ensure you're using the correct API base URL
2. Check browser console for specific CORS error messages
3. Verify the server is running and accessible

## Security Considerations

- **Never commit `.env` file**: Already in `.gitignore`
- **Use environment variables**: For all sensitive credentials
- **HTTPS in production**: Always use HTTPS for payment processing
- **Validate all inputs**: Server validates all requests
- **Keep dependencies updated**: Run `npm audit` regularly

## Support

For issues or questions:
- Email: Sviievmla@gmail.com
- Facebook: https://facebook.com/Storyframesvarna/

## Version History

- **v1.0.0** (February 2026)
  - Initial unified backend implementation
  - PayPal order creation and capture
  - Email notification system
  - Comprehensive input validation
  - Error handling and logging
