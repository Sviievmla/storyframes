# Story Frames - E-commerce Platform

A modern e-commerce platform for personalized photo gifts with integrated PayPal payment processing.

## 🌟 Features

- **Product Catalog**: Video Ball, Premium Frame, and Digital Greeting Card
- **Shopping Cart**: Full cart management with localStorage persistence
- **Secure Payments**: Production-ready PayPal integration with backend processing
- **Multiple Payment Options**: PayPal, Credit/Debit Cards, and Cash on Delivery (Bulgaria only)
- **Bilingual Support**: English and Bulgarian (auto-translation system)
- **Responsive Design**: Mobile-first approach with modern UI
- **Order Management**: Email-based order notifications and confirmations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- PayPal Business Account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sviievmla/storyframes.git
   cd storyframes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure PayPal credentials**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your PayPal credentials:
   ```env
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   PORT=3000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   
   The server will start on http://localhost:3000

5. **Open the website**
   
   Open http://localhost:3000 in your browser

## 🔑 PayPal Configuration

### Getting PayPal Credentials

1. **Sandbox (Testing)**:
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Navigate to "Apps & Credentials"
   - Under "Sandbox", click "Create App"
   - Copy the Client ID and Secret
   - Use `https://api-m.sandbox.paypal.com` as the API base URL

2. **Production (Live)**:
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Navigate to "Apps & Credentials"
   - Switch to "Live" tab
   - Click "Create App"
   - Copy the Client ID and Secret
   - Use `https://api-m.paypal.com` as the API base URL
   - Update `.env` with live credentials

### Testing Payments in Sandbox

PayPal provides test accounts for sandbox testing:

1. Go to [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
2. Use the provided test buyer accounts to complete test transactions
3. Or create your own test accounts

**Test Card Details** (provided by PayPal sandbox):
- Card Number: 4032039278424576
- Expiry: Any future date
- CVV: Any 3 digits

## 📁 Project Structure

```
storyframes/
├── server.js              # Express backend server
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── checkout.html         # Checkout page with payment integration
├── index.html            # Homepage
├── styles.css            # Global styles
├── i18n.js              # Internationalization system
├── logo.png             # Brand logo
└── [product pages]       # Individual product detail pages
```

## 🛠️ Backend API Endpoints

### POST `/api/paypal/create-order`

Creates a PayPal order for the cart items.

**Request Body:**
```json
{
  "cart": [
    {
      "name": "Video Ball",
      "price": 59.99,
      "quantity": 1
    }
  ],
  "total": 59.99
}
```

**Response:**
```json
{
  "orderID": "7XX123456Y7891234"
}
```

### POST `/api/paypal/capture-order`

Captures (completes) a PayPal order after buyer approval.

**Request Body:**
```json
{
  "orderID": "7XX123456Y7891234"
}
```

**Response:**
```json
{
  "id": "7XX123456Y7891234",
  "status": "COMPLETED",
  ...
}
```

### GET `/api/health`

Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T22:30:00.000Z",
  "paypalConfigured": true
}
```

## 🎨 Frontend Features

### Shopping Experience
- Browse products with detailed descriptions
- Add items to cart with quantity selection
- Real-time cart updates and total calculations
- Persistent cart using localStorage

### Checkout Flow
1. **Cart Review**: View order summary with all items
2. **Customer Details**: Enter shipping and contact information
3. **Payment Method**: Choose from PayPal, Card, or COD (Bulgaria)
4. **Payment**: Secure payment processing via backend
5. **Confirmation**: Order confirmation with order ID

### Language Support
- Toggle between English (EN) and Bulgarian (BG)
- Automatic translation of all UI elements
- Language preference saved in localStorage

## 🌐 Deployment

### Deploying to Production

1. **Update PayPal Credentials**:
   - Switch from sandbox to live credentials in `.env`
   - Update `PAYPAL_API_BASE` to `https://api-m.paypal.com`

2. **Frontend Static Files**:
   - All HTML, CSS, JS, and image files can be deployed to any static hosting (Netlify, Vercel, GitHub Pages)
   - Or served directly by the Express server (current setup)

3. **Backend Server**:
   - Deploy to Node.js hosting platform (Heroku, Railway, Render, DigitalOcean, etc.)
   - Set environment variables in your hosting platform
   - Ensure PORT is configured (most platforms set this automatically)

4. **Update Frontend API URLs**:
   - If backend is on a different domain, update API URLs in `checkout.html`
   - Currently set to use relative URLs (works when frontend and backend are served together)

### Example Deployment Platforms

**Heroku**:
```bash
heroku create your-app-name
heroku config:set PAYPAL_CLIENT_ID=your_client_id
heroku config:set PAYPAL_CLIENT_SECRET=your_client_secret
heroku config:set PAYPAL_API_BASE=https://api-m.paypal.com
git push heroku main
```

**Railway**:
```bash
railway init
railway add
# Add environment variables in Railway dashboard
railway up
```

**Render**:
- Create new Web Service
- Connect your GitHub repository
- Add environment variables
- Deploy

## 📧 Email Notifications

Order confirmations are sent via `mailto:` links, which opens the user's email client with pre-filled order details. For production, consider integrating:
- SendGrid
- Mailgun
- AWS SES
- NodeMailer with SMTP

## 🔒 Security Notes

- PayPal credentials are stored securely in environment variables (never in code)
- All payment processing happens server-side
- No credit card data is ever stored or handled by your application
- PayPal handles all PCI compliance requirements
- CORS is enabled but can be restricted to specific domains in production

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Navigate to checkout
- [ ] Fill in customer details form
- [ ] Select PayPal payment method
- [ ] Complete PayPal sandbox payment
- [ ] Verify order confirmation modal
- [ ] Check email notification (manually opened)
- [ ] Test Cash on Delivery (Bulgaria orders)
- [ ] Test responsive design on mobile
- [ ] Test language switching (EN/BG)

### Browser Compatibility

Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### "PayPal credentials not configured" error
- Ensure `.env` file exists in the root directory
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set correctly
- Restart the server after changing `.env`

### PayPal payment not working
- Check that you're using the correct API base URL (sandbox vs production)
- Verify your PayPal app has the correct permissions
- Check browser console for detailed error messages
- Ensure backend server is running and accessible

### Cart not persisting
- Check that localStorage is enabled in the browser
- Clear browser cache and try again
- Check browser console for errors

## 📝 License

ISC

## 🤝 Support

For questions or support:
- Email: Sviievmla@gmail.com
- Facebook: [Story Frames Varna](https://facebook.com/Storyframesvarna/)

## 🎯 Future Enhancements

- Database integration for order management
- Admin dashboard for order tracking
- Automated email notifications
- Inventory management
- Discount codes and coupons
- Multiple shipping options
- Advanced analytics
- Customer accounts
