# Story Frames Payment API Documentation

This document describes the REST API endpoints provided by the Story Frames checkout backend.

## Base URL

- **Production**: `https://storyframes-backend.onrender.com`
- **Custom Domain**: `https://api.mystoryframes.shop` (if configured)
- **Development**: `http://localhost:10000`

## Authentication

Most endpoints do not require authentication. Administrative endpoints (orders, refunds) should be protected with authentication in a future version.

## Endpoints

### Health Check

Check if the backend is running and properly configured.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T16:00:00.000Z",
  "environment": "production",
  "paypalConfigured": true,
  "databaseConnected": true,
  "emailConfigured": true
}
```

**Status Codes**:
- `200 OK`: Service is healthy

---

### Create PayPal Order

Creates a new PayPal order for payment processing.

**Endpoint**: `POST /api/paypal/create-order`

**Rate Limit**: 20 requests per 15 minutes per IP

**Request Body**:
```json
{
  "cart": [
    {
      "name": "Premium Frame - Digital",
      "price": 24.99,
      "quantity": 1
    },
    {
      "name": "Video Ball Frame",
      "price": 19.99,
      "quantity": 2
    }
  ],
  "total": 64.97,
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+359123456789",
    "address": "123 Main St",
    "city": "Sofia",
    "country": "Bulgaria"
  }
}
```

**Required Fields**:
- `cart`: Array of cart items (minimum 1 item)
  - `name`: Product name (string, max 127 chars)
  - `price`: Unit price (number, min 0)
  - `quantity`: Quantity (number, min 1, optional, defaults to 1)
- `total`: Total amount (number, min 0.01)

**Optional Fields**:
- `customerInfo`: Customer information object (stored for reference)

**Response** (Success):
```json
{
  "orderID": "5O190127TN364715T"
}
```

**Response** (Error):
```json
{
  "error": "Invalid request",
  "details": [
    {
      "msg": "Cart must be a non-empty array",
      "param": "cart"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Order created successfully
- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Capture PayPal Order

Captures payment for a previously created order.

**Endpoint**: `POST /api/paypal/capture-order`

**Rate Limit**: 20 requests per 15 minutes per IP

**Request Body**:
```json
{
  "orderID": "5O190127TN364715T"
}
```

**Required Fields**:
- `orderID`: PayPal order ID from create-order response

**Response** (Success):
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "purchase_units": [...],
  "payer": {...},
  ...
}
```

**Status Codes**:
- `200 OK`: Payment captured successfully
- `400 Bad Request`: Invalid order ID
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Process Refund

Processes a full or partial refund for a captured payment.

**Endpoint**: `POST /api/paypal/refund`

**Rate Limit**: 20 requests per 15 minutes per IP

**Request Body**:
```json
{
  "captureId": "8BP1234567890123A",
  "amount": 24.99,
  "note": "Customer requested refund"
}
```

**Required Fields**:
- `captureId`: PayPal capture ID (from capture response)

**Optional Fields**:
- `amount`: Refund amount (omit for full refund)
- `note`: Note to customer (string)

**Response** (Success):
```json
{
  "id": "1JU08902CY3241532",
  "status": "COMPLETED",
  "amount": {
    "currency_code": "EUR",
    "value": "24.99"
  },
  ...
}
```

**Status Codes**:
- `200 OK`: Refund processed successfully
- `400 Bad Request`: Invalid capture ID or amount
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### PayPal Webhook

Receives notifications from PayPal about payment events.

**Endpoint**: `POST /api/paypal/webhook`

**Note**: This endpoint is called by PayPal, not by your frontend.

**Webhook Events Handled**:
- `PAYMENT.CAPTURE.COMPLETED`: Payment successfully captured
- `PAYMENT.CAPTURE.DENIED`: Payment denied
- `PAYMENT.CAPTURE.REFUNDED`: Payment refunded
- `CHECKOUT.ORDER.APPROVED`: Order approved by customer

**Setup**: See PAYPAL-LIVE-SETUP.md for webhook configuration

**Response**:
```json
{
  "received": true
}
```

**Status Codes**:
- `200 OK`: Webhook processed
- `401 Unauthorized`: Invalid signature
- `500 Internal Server Error`: Processing error

---

### Get Orders

Retrieves a list of orders with pagination.

**Endpoint**: `GET /api/orders`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `status`: Filter by status (optional)
  - Values: `CREATED`, `APPROVED`, `COMPLETED`, `FAILED`, `DENIED`

**Example Request**:
```
GET /api/orders?page=1&limit=20&status=COMPLETED
```

**Response**:
```json
{
  "orders": [
    {
      "id": 1,
      "paypal_order_id": "5O190127TN364715T",
      "amount": "64.97",
      "currency": "EUR",
      "status": "COMPLETED",
      "cart_items": "[{...}]",
      "customer_info": "{...}",
      "created_at": "2026-02-10T16:00:00.000Z",
      "captured_at": "2026-02-10T16:05:00.000Z"
    },
    ...
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

**Status Codes**:
- `200 OK`: Orders retrieved successfully
- `500 Internal Server Error`: Server error

---

### Get Order by ID

Retrieves a specific order by PayPal order ID.

**Endpoint**: `GET /api/orders/:id`

**Parameters**:
- `id`: PayPal order ID

**Example Request**:
```
GET /api/orders/5O190127TN364715T
```

**Response**:
```json
{
  "id": 1,
  "paypal_order_id": "5O190127TN364715T",
  "amount": "64.97",
  "currency": "EUR",
  "status": "COMPLETED",
  "cart_items": "[{\"name\":\"Premium Frame\",\"price\":24.99,\"quantity\":1}]",
  "customer_info": "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}",
  "capture_data": "{...}",
  "created_at": "2026-02-10T16:00:00.000Z",
  "captured_at": "2026-02-10T16:05:00.000Z",
  "updated_at": "2026-02-10T16:05:00.000Z"
}
```

**Status Codes**:
- `200 OK`: Order found
- `404 Not Found`: Order not found
- `500 Internal Server Error`: Server error

---

## Error Responses

All endpoints may return these error formats:

### Validation Error:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "msg": "Cart must be a non-empty array",
      "param": "cart",
      "location": "body"
    }
  ]
}
```

### General Error:
```json
{
  "error": "Internal server error",
  "message": "Error description (only in development)"
}
```

### Rate Limit Error:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Rate Limiting

Different rate limits apply to different endpoints:

**General API Endpoints**: 100 requests per 15 minutes per IP
- `/api/health`
- `/api/orders`
- `/api/orders/:id`

**Payment Endpoints** (stricter): 20 requests per 15 minutes per IP
- `/api/paypal/create-order`
- `/api/paypal/capture-order`
- `/api/paypal/refund`

**No Rate Limit**:
- `/api/paypal/webhook` (called by PayPal)

## CORS

The backend accepts requests from:
- `https://mystoryframes.shop`
- `https://www.mystoryframes.shop`
- `http://localhost:3000` (development)
- `http://localhost:5500` (development)
- Additional origins from `FRONTEND_URL` environment variable

## Order Status Flow

1. **CREATED**: Order created, awaiting payment
2. **APPROVED**: Customer approved payment (webhook event)
3. **COMPLETED**: Payment captured successfully
4. **FAILED**: Payment capture failed
5. **DENIED**: Payment denied by PayPal

## Testing

### Test Health Endpoint:
```bash
curl https://storyframes-backend.onrender.com/api/health
```

### Test Create Order:
```bash
curl -X POST https://storyframes-backend.onrender.com/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [{"name": "Test Product", "price": 1.00, "quantity": 1}],
    "total": 1.00
  }'
```

### Test Get Orders:
```bash
curl https://storyframes-backend.onrender.com/api/orders?page=1&limit=10
```

## Database Schema

See DATABASE-SETUP.md for complete schema documentation.

**Orders Table**: Stores all payment orders
**Refunds Table**: Stores all refund transactions

## Email Notifications

When payment is captured successfully:
1. **Customer Email**: Order confirmation with details
2. **Admin Email**: New order notification

Configure in environment variables:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `EMAIL_FROM`, `ADMIN_EMAIL`

## Security

- **Helmet**: Security headers enabled
- **CORS**: Restricted to allowed origins
- **Rate Limiting**: Prevents abuse
- **Input Validation**: All inputs validated and sanitized
- **HTTPS**: Required in production
- **Webhook Verification**: PayPal signatures verified

## Monitoring

Check logs for:
- Order creation: `"Creating PayPal order"`
- Order capture: `"Order captured successfully"`
- Email sent: `"Order confirmation email sent"`
- Errors: `"ERROR"` level logs

## Support

- API Issues: Check Render logs
- PayPal Issues: https://developer.paypal.com/support/
- Database Issues: See DATABASE-SETUP.md
- Email Issues: Verify SMTP credentials

## Changelog

**v2.0.0** (February 2026):
- Production-ready backend with PostgreSQL
- Email notifications
- Security enhancements
- Webhook handling
- Order management endpoints
- Refund processing

**v1.0.0** (Initial):
- Basic PayPal integration
- Order creation and capture
