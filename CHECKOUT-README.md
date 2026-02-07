# Checkout Flow Documentation

## Overview

The Story Frames checkout page (`checkout.html`) implements a complete e-commerce checkout flow with multiple payment options, secure backend payment processing, and comprehensive user experience features.

## Architecture

The checkout system uses a **client-server architecture** for secure payment processing:

- **Frontend** (`checkout.html`): User interface, form validation, PayPal buttons
- **Backend** (`backend/server.js`): Secure PayPal order creation and capture via server-side API
- **PayPal API**: Payment processing and authorization

This architecture ensures that PayPal client secrets remain secure on the server and never exposed to the client.

## Features

### 1. Payment Methods

The checkout supports three payment methods:

#### PayPal / Credit Card (Real)
- **Status**: Fully functional with backend integration
- **Description**: Integration with PayPal Smart Payment Buttons via secure backend API
- **Supported**: PayPal account, Credit cards, Debit cards
- **Backend**: Order creation and capture handled server-side
- **Configuration**: Requires backend server running with PayPal credentials
- **Test Mode**: Backend configured with sandbox credentials by default
- **Production**: Update backend `.env` file with live PayPal credentials

#### Credit/Debit Card (PayPal)
- **Status**: Fully functional with backend integration
- **Description**: Card payments processed by PayPal Smart Payment Buttons via secure backend
- **Supported**: Visa, Mastercard, Amex, and other cards supported by PayPal
- **Backend**: Same secure server-side processing as PayPal method
- **Note**: Uses the same backend PayPal credentials as the PayPal option

#### Cash on Delivery (COD)
- **Status**: Fully functional
- **Description**: Available only for Bulgaria orders
- **Workflow**: Sends order details via email to store owner
- **Visibility**: Automatically shown/hidden based on country selection

### 2. Form Validation

#### Required Fields
- Full Name
- Email Address (with format validation)
- Phone Number
- Shipping Address
- City
- Country

#### Optional Fields
- Postal Code
- Order Notes

#### Validation Features
- Real-time field validation
- Visual error indicators (red border, error messages)
- Email format validation using regex
- Form submission prevention if validation fails
- Card validation handled securely by PayPal

### 3. User Experience Enhancements

#### Loading States
- Loading overlay displayed during payment processing
- Spinner animation with processing message
- Prevents multiple submissions with disabled buttons
- Body scroll lock during loading

#### Success Confirmation
- Modal popup with success icon
- Order ID display (PayPal order ID or `COD-xxx`)
- Success message with next steps
- Continue shopping button redirects to homepage

#### Error Handling
- Payment failure alerts with descriptive messages
- Form validation errors with inline messages
- PayPal cancellation handling
- Network error handling

#### Order Summary
- Real-time cart display with product images
- Quantity and price per item
- Subtotal and total calculations
- Empty cart state with call-to-action

### 4. Payment Method Selection UI

- Visual card-based selection interface
- Radio buttons for accessibility
- Selected state highlighting with color and border
- Icon indicators for each payment method
- Descriptive text for each option
- Dynamic show/hide of payment forms based on selection

### 5. UI/UX Enhancements

#### Above-the-Fold Payment CTA
- **Prominent Payment Section**: Order summary and payment buttons displayed first (left column on desktop)
- **Sticky Positioning**: Payment section stays visible while scrolling on desktop
- **Visual Prominence**: Enhanced border and shadow effects draw attention to payment area
- **Mobile-First**: On mobile devices, payment summary appears at top for immediate visibility

#### Responsive Design
- Mobile-optimized layout
- Touch-friendly controls
- Stacked columns on mobile devices (payment first, then customer details)
- Full-width buttons for easy tapping
- Accessible font sizes and spacing
- Sticky positioning automatically disabled on mobile

## Backend Configuration

### Prerequisites

1. **Node.js 14+** installed on your server
2. **PayPal Business Account** with API credentials
3. **Backend server** running and accessible from frontend

### Backend Setup

See detailed instructions in `backend/README.md`. Quick start:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your PayPal credentials
# PAYPAL_MODE=sandbox (or live)
# PAYPAL_CLIENT_ID=your_client_id
# PAYPAL_CLIENT_SECRET=your_client_secret
# FRONTEND_URL=https://mystoryframes.shop

# Start server
npm start
```

The backend server provides two API endpoints:
- `POST /api/create-order` - Creates PayPal order with cart and customer data
- `POST /api/capture-order` - Captures payment after user authorization

### Frontend Configuration

Update the `BACKEND_URL` constant in `checkout.html` (line ~609):

```javascript
// For local development
const BACKEND_URL = 'http://localhost:3000';

// For production (update with your backend URL)
const BACKEND_URL = 'https://your-backend-domain.com';
```

## Configuration

### PayPal Integration (Backend)

The checkout now uses **server-side PayPal integration** for enhanced security. PayPal client secrets are stored securely on the backend server.

**Backend Configuration** (in `backend/.env`):

```env
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PORT=3000
FRONTEND_URL=https://mystoryframes.shop
```

**Getting PayPal Credentials**:

For **Sandbox (Testing)**:
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to "Apps & Credentials" → "Sandbox"
3. Create a new app
4. Copy Client ID and Secret to backend `.env` file

For **Live (Production)**:
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to "Apps & Credentials" → "Live" tab
3. Create a new app
4. Copy Live Client ID and Secret to backend `.env`
5. Update `PAYPAL_MODE=live` in `.env`
6. Restart backend server

**Frontend PayPal SDK** (in `checkout.html` line ~51):

The frontend still loads PayPal SDK for the button UI, but order creation/capture is handled by the backend:

```html
<script src="https://www.paypal.com/sdk/js?client-id=AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUed2TK-uhjVCt_b&currency=EUR&intent=capture&enable-funding=card"></script>
```

Note: The client-id in the SDK script tag can remain as sandbox client ID since the actual payment processing happens server-side. However, for production, it's recommended to use your live client ID here as well.

### Card Funding Configuration

The card checkout button is powered by the PayPal SDK with `enable-funding=card`. Keep this parameter enabled in production to allow direct card payments.

### Email Configuration

Order confirmations are sent to: `Sviievmla@gmail.com`

To change the recipient email, search for `Sviievmla@gmail.com` in `checkout.html` and update all occurrences.

## Deployment Guide

### Prerequisites for Production

1. **Backend Server**: Deployed and accessible from the internet
2. **PayPal Live Credentials**: Obtained from PayPal Developer Dashboard
3. **HTTPS**: SSL/TLS certificate for both frontend and backend (required by PayPal)
4. **CORS Configuration**: Backend FRONTEND_URL must match your actual domain

### Step-by-Step Production Deployment

#### 1. Deploy Backend Server

Choose one of these platforms (see `backend/README.md` for detailed instructions):

**Option A: Heroku** (Free tier available)
```bash
cd backend
heroku create storyframes-backend
heroku config:set PAYPAL_MODE=live
heroku config:set PAYPAL_CLIENT_ID=your_live_client_id
heroku config:set PAYPAL_CLIENT_SECRET=your_live_client_secret
heroku config:set FRONTEND_URL=https://mystoryframes.shop
git push heroku main
```

**Option B: Railway** (Easy GitHub integration)
- Connect GitHub repo to Railway
- Set environment variables in dashboard
- Auto-deploy on push

**Option C: Vercel** (Serverless)
```bash
cd backend
vercel --prod
```

**Option D: VPS** (DigitalOcean, AWS, etc.)
```bash
# Install Node.js, PM2, and setup reverse proxy
pm2 start server.js --name storyframes-backend
```

#### 2. Get Live PayPal Credentials

1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click "Apps & Credentials"
3. Switch to **"Live"** tab
4. Click "Create App"
5. Name it "Story Frames Production"
6. Copy **Client ID** and **Secret**
7. Update backend `.env`:
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   FRONTEND_URL=https://mystoryframes.shop
   ```

#### 3. Update Frontend

Edit `checkout.html` line ~609:

```javascript
// Replace localhost with your deployed backend URL
const BACKEND_URL = 'https://your-backend-domain.com';
```

Examples:
- Heroku: `https://storyframes-backend.herokuapp.com`
- Railway: `https://storyframes-backend.up.railway.app`
- Vercel: `https://storyframes-backend.vercel.app`
- Custom domain: `https://api.mystoryframes.shop`

#### 4. Test Payment Flow

Before going live:
1. Use PayPal Sandbox to test the full flow
2. Switch to live credentials
3. Make a **real test payment** with a small amount (€1.00)
4. Verify order appears in PayPal dashboard
5. Check email confirmation is sent
6. Confirm cart clears and success modal shows

#### 5. Monitor and Maintain

- Check backend server logs regularly
- Monitor PayPal dashboard for transactions
- Set up error alerts (e.g., Sentry, LogRocket)
- Keep dependencies updated: `npm audit` and `npm update`

### Backend Deployment Platforms Comparison

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Heroku** | Easy setup, free tier | Slower cold starts | Quick deployment |
| **Railway** | GitHub integration, generous free tier | Newer platform | Modern workflow |
| **Vercel** | Serverless, auto-scaling | Cold starts | Static sites + API |
| **DigitalOcean** | Full control, droplets | More setup | Production apps |
| **AWS/GCP** | Enterprise-grade | Complex pricing | Large scale |

## Current Limitations and Considerations

### Current Limitations

1. **Backend Server Required**
   - Unlike the previous client-side only setup, you now need a backend server
   - Backend must be accessible from your frontend domain
   - CORS must be properly configured

2. **Email-based Order Notifications**
   - Orders trigger mailto: links for email notifications
   - Requires email client configured on user's device
   - Consider integrating SendGrid/Mailgun for automated emails

3. **Cart Persistence**
   - Cart stored in localStorage only
   - Cart is cleared on successful order
   - No server-side cart backup
   - Lost if user clears browser data

4. **No Inventory Management**
   - No stock checking
   - No quantity limits
   - Items always show as available

### Security Considerations

- ✅ **PayPal Client Secret**: Now securely stored on backend (never exposed to client)
- ✅ **All payments handled by PayPal**: Secure PCI-compliant processing
- ✅ **Card data**: Collected by PayPal-hosted fields, never touches your servers
- ✅ **Server-side validation**: Backend validates all order data before processing
- ⚠️ **HTTPS required**: Both frontend and backend must use SSL/TLS in production
- ⚠️ **CORS configuration**: Restrict FRONTEND_URL to your actual domain
- ⚠️ **Rate limiting**: Consider adding rate limiting to backend API endpoints

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage support
- PayPal SDK works on all major browsers
- Fetch API for backend calls (supported in all modern browsers)

## Integration with Additional Payment Gateways

To add another card payment gateway (e.g., Stripe) alongside PayPal, replace the card payment section:

### Example: Stripe Integration

1. Add Stripe SDK:
```html
<script src="https://js.stripe.com/v3/"></script>
```

2. Replace the card payment section with Stripe Elements
3. Update the checkout flow to use Stripe's payment confirmation
4. Handle webhook for order confirmation

### Example: Square Integration

1. Add Square SDK
2. Use Square Payment Form
3. Replace the card payment section with Square API calls

## Testing

### Local Development Testing

#### 1. Start Backend Server

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with sandbox credentials
npm start
```

Backend should be running on `http://localhost:3000`

#### 2. Start Frontend Server

For local testing, you need a simple HTTP server. Use one of these:

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js http-server
npx http-server -p 8080

# Option 3: VS Code Live Server extension
```

Frontend should be accessible at `http://localhost:8080/checkout.html`

#### 3. Update BACKEND_URL for Local Testing

In `checkout.html` line ~609, ensure it points to your local backend:

```javascript
const BACKEND_URL = 'http://localhost:3000';
```

### Test PayPal Payment (Sandbox)

1. **Add items to cart** from the main store pages
2. **Navigate to checkout** page
3. **Fill in customer details**:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +359 888 123 456
   - Address: 123 Main St
   - City: Sofia
   - Country: Bulgaria
4. **Select PayPal payment method** (default)
5. **Click PayPal button**
6. **Log in with PayPal Sandbox account**:
   - Go to [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
   - Use a test buyer account (Personal account)
   - Email: `sb-buyer@personal.example.com`
   - Password: provided in sandbox dashboard
7. **Complete payment** in PayPal popup
8. **Verify**:
   - Success modal appears with order ID
   - Cart is cleared
   - Email notification sent (via mailto:)
   - Order appears in PayPal sandbox dashboard

### Test Card Payment (PayPal)

1. Add items to cart
2. Go to checkout
3. Fill in customer details
4. **Select "Credit/Debit Card"** payment option
5. Click the card payment button
6. In PayPal popup, choose **"Pay with Debit or Credit Card"**
7. Use PayPal test card numbers:
   - Visa: 4032039974429775
   - Mastercard: 5425233430109903
   - Exp: Any future date
   - CVV: Any 3 digits
8. Complete payment
9. Confirm order success modal appears

### Test Cash on Delivery (COD)

1. Add items to cart
2. Go to checkout
3. Fill in customer details
4. **Important**: Select **"Bulgaria"** as country
5. COD option appears automatically
6. Select COD payment method
7. Click "Complete Order (COD)"
8. Email client opens with pre-filled order details
9. Verify order details are correct in email

### Backend API Testing

Test backend endpoints directly:

```bash
# Health check
curl http://localhost:3000/api/health

# Create order (use real cart data)
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [{"name":"Test Frame","price":"49.99","quantity":1,"description":"Test"}],
    "customer": {"name":"John Doe","email":"john@example.com","address":"123 Main","city":"Sofia","postalCode":"1000","countryCode":"BG"}
  }'

# Expected response: {"orderID":"5O190127TN364715T"}
```

## Internationalization

The checkout page supports English and Bulgarian languages through the `i18n.js` system.

### New Translation Keys Added:
- `paypal_desc` - PayPal payment method description
- `card_desc` - Card payment method description
- `cod_desc` - COD payment method description
- `order_success` - Success modal title
- `order_success_message` - Success modal message

To add more languages, update the `translations` object in `i18n.js`.

## Future Enhancements

Recommended improvements for production:

1. **Enhanced Backend Features** ✅ *Partially Implemented*
   - ✅ Server-side PayPal order creation and capture
   - ✅ Environment-based configuration (sandbox/live)
   - ⚠️ Order persistence to database (not implemented)
   - ⚠️ Automated email service (SendGrid/Mailgun)
   - ⚠️ Inventory tracking
   - ⚠️ Order status tracking dashboard
   - ⚠️ Webhook handlers for PayPal events

2. **Additional Payment Gateways**
   - Stripe integration for alternative card processing
   - Square integration
   - PCI compliance validation
   - 3D Secure authentication
   - Recurring billing support

3. **Enhanced Features**
   - User accounts and order history
   - Guest checkout option
   - Save customer addresses
   - Multiple shipping addresses
   - Real-time shipping cost calculation
   - Tax calculation based on location
   - Discount codes/coupons system
   - Order tracking page with status updates

4. **Analytics & Monitoring**
   - Conversion tracking (Google Analytics events)
   - Abandoned cart recovery emails
   - Payment method usage statistics
   - Error tracking (Sentry integration)
   - Real-time monitoring dashboard
   - A/B testing for checkout flow

5. **Security Enhancements**
   - Rate limiting on backend API endpoints
   - CAPTCHA for high-risk transactions
   - Fraud detection integration
   - IP-based blocking
   - Advanced CSRF protection
   - Security headers (helmet.js)
   - Payment method usage statistics
   - Error tracking

5. **Security**
   - Server-side validation
   - HTTPS enforcement
   - CSRF protection
   - Rate limiting

## Support

For questions or issues:
- Email: Sviievmla@gmail.com
- Facebook: https://facebook.com/Storyframesvarna/

## Version History

- **v2.1** (February 2026)
  - Replaced mock card checkout with PayPal card processing
  - Updated payment descriptions and documentation

- **v1.0** (Initial Release)
  - Basic checkout form
  - PayPal integration
  - COD support for Bulgaria
