# Story Frames Backend - Quick Setup Guide

Production-ready PayPal payment backend optimized for Render deployment.

## Features ✨

- ✅ **Real PayPal Payments**: Live payment processing with PayPal Business API
- ✅ **PostgreSQL Database**: Order storage, tracking, and history
- ✅ **Email Notifications**: Customer confirmations and admin alerts
- ✅ **Security**: Rate limiting, CORS, input validation, Helmet
- ✅ **Webhooks**: Real-time PayPal event handling
- ✅ **Refunds**: Full and partial refund processing
- ✅ **Order Management**: API endpoints for order retrieval
- ✅ **Logging**: Winston-based structured logging
- ✅ **Render Optimized**: Port 10000, auto-deploy, health checks

## Quick Start 🚀

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# PayPal Live Credentials
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_API_BASE=https://api-m.paypal.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@mystoryframes.shop
```

### 3. Run Locally

```bash
npm start
```

Server runs on http://localhost:10000

### 4. Test

```bash
# Health check
curl http://localhost:10000/api/health

# Should return:
# {"status":"ok","timestamp":"...","paypalConfigured":true,...}
```

## Deployment 🌐

### Deploy to Render

See **[RENDER-DEPLOYMENT.md](RENDER-DEPLOYMENT.md)** for complete instructions.

**Summary**:
1. Create PostgreSQL database on Render
2. Create Web Service connected to GitHub repo
3. Set environment variables
4. Deploy automatically

### Configure PayPal Live

See **[PAYPAL-LIVE-SETUP.md](PAYPAL-LIVE-SETUP.md)** for step-by-step guide.

**Summary**:
1. Create PayPal Business account
2. Get live API credentials from Developer Dashboard
3. Configure webhooks
4. Update frontend with live client ID

## Documentation 📚

- **[RENDER-DEPLOYMENT.md](RENDER-DEPLOYMENT.md)**: Complete Render deployment guide
- **[PAYPAL-LIVE-SETUP.md](PAYPAL-LIVE-SETUP.md)**: PayPal live setup instructions
- **[DATABASE-SETUP.md](DATABASE-SETUP.md)**: Database schema and management
- **[API-DOCUMENTATION.md](API-DOCUMENTATION.md)**: API endpoints reference

## Project Structure 📁

```
storyframes/
├── server.js                  # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment template
├── utils/
│   ├── logger.js            # Winston logging
│   ├── database.js          # PostgreSQL client
│   └── emailService.js      # Email notifications
├── checkout.html            # Frontend checkout page
├── RENDER-DEPLOYMENT.md     # Render deployment guide
├── PAYPAL-LIVE-SETUP.md     # PayPal setup guide
├── DATABASE-SETUP.md        # Database documentation
└── API-DOCUMENTATION.md     # API reference
```

## API Endpoints 🔌

### Payment Processing
- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-order` - Capture payment
- `POST /api/paypal/refund` - Process refund
- `POST /api/paypal/webhook` - PayPal webhook handler

### Order Management
- `GET /api/orders` - List orders (paginated)
- `GET /api/orders/:id` - Get specific order
- `GET /api/health` - Health check

See [API-DOCUMENTATION.md](API-DOCUMENTATION.md) for details.

## Environment Variables 🔐

### Required
```bash
NODE_ENV=production
PORT=10000
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_API_BASE=https://api-m.paypal.com
DATABASE_URL=postgresql://...
```

### Optional (Email)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASSWORD=xxx
EMAIL_FROM=noreply@mystoryframes.shop
ADMIN_EMAIL=admin@mystoryframes.shop
```

### Optional (Advanced)
```bash
PAYPAL_WEBHOOK_ID=xxx
FRONTEND_URL=https://mystoryframes.shop
LOG_LEVEL=info
```

## Database 🗄️

**Automatic Setup**: Tables are created automatically on first startup.

**Schema**:
- `orders`: Payment orders and customer data
- `refunds`: Refund transactions

**Management**:
```bash
# Connect via Render Shell or psql
psql $DATABASE_URL

# View orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

# View refunds
SELECT * FROM refunds ORDER BY created_at DESC LIMIT 10;
```

See [DATABASE-SETUP.md](DATABASE-SETUP.md) for details.

## Security 🔒

- ✅ Helmet security headers
- ✅ CORS restricted to allowed origins
- ✅ Rate limiting (100 req/15min general, 20 req/15min payments)
- ✅ Input validation and sanitization
- ✅ Webhook signature verification
- ✅ HTTPS required in production
- ✅ No sensitive data in logs

## Email Notifications 📧

**Automatically sent on successful payment**:
1. **Customer**: Order confirmation with details
2. **Admin**: New order notification

**Supported SMTP Providers**:
- Gmail (use App Password)
- SendGrid
- Mailgun
- Any SMTP server

## Monitoring 📊

### Health Check
```bash
curl https://storyframes-backend.onrender.com/api/health
```

### Logs
Check Render dashboard → Logs tab for:
- Order creation/capture events
- Payment failures
- Email notifications
- Webhook events
- Errors

### Database
Monitor orders and refunds via SQL queries or API endpoints.

## Troubleshooting 🔧

### "PayPal credentials not configured"
- Check environment variables are set
- Verify credentials are from **Live** (not Sandbox)

### "Database connection failed"
- Verify DATABASE_URL is correct
- Use Internal URL on Render
- Check database is running

### "Email service not configured"
- Verify all SMTP credentials are set
- For Gmail: use App Password, not regular password
- Test SMTP connection

### "CORS error"
- Ensure FRONTEND_URL is set correctly
- Check allowed origins in server.js

See documentation files for detailed troubleshooting.

## Development 💻

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with your credentials

# 3. Start local database (optional)
# Use local PostgreSQL or Render's database

# 4. Run server
npm start

# 5. Test
curl http://localhost:10000/api/health
```

### Testing Payments

**Use Sandbox for Testing**:
1. Change `PAYPAL_API_BASE` to sandbox
2. Use sandbox credentials
3. Use PayPal test accounts

**Go Live**:
1. Switch to live credentials
2. Update `PAYPAL_API_BASE` to production
3. Update frontend client ID
4. Test with small real payment

## Cost Estimate 💰

### Render
- **Web Service**: $7/month (Starter) or $0 (Free with limitations)
- **PostgreSQL**: $7/month (Starter) or $0 (Free with limitations)

### PayPal Fees
- **Standard**: 2.9% + €0.35 per transaction
- **Example**: €50 sale = €1.80 fee, you receive €48.20

### Total
- **Minimal**: ~$14/month + transaction fees
- **Free Tier**: $0/month (testing only)

## Support 💬

- **Documentation**: See markdown files in this repo
- **Render Support**: https://render.com/docs
- **PayPal Support**: https://developer.paypal.com/support/
- **Email**: Sviievmla@gmail.com

## License

ISC

## Version

**v2.0.0** - Production-ready with full features
