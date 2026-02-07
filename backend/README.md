# Story Frames Backend Server

## Overview

This is a minimal Node.js/Express backend server that handles secure PayPal payment processing for the Story Frames checkout flow. The server acts as an intermediary between your frontend and PayPal's API, keeping your PayPal client secret secure.

## Features

- ✅ **Secure PayPal Integration**: Server-side order creation and capture
- ✅ **Environment Variables**: Configurable for sandbox/production modes
- ✅ **CORS Support**: Cross-origin requests from your frontend
- ✅ **Error Handling**: Comprehensive error messages and logging
- ✅ **Validation**: Server-side validation of cart and customer data
- ✅ **Lightweight**: Minimal dependencies, easy to deploy

## Prerequisites

- Node.js 14+ installed
- PayPal Business Account
- PayPal Developer Account for API credentials

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your PayPal credentials:

```env
# For testing (Sandbox)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret

# For production (Live)
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret

PORT=3000
FRONTEND_URL=https://mystoryframes.shop
```

### 3. Get PayPal Credentials

#### For Testing (Sandbox):

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Navigate to "Apps & Credentials"
4. Under "Sandbox", click "Create App"
5. Name your app (e.g., "Story Frames Sandbox")
6. Copy the **Client ID** and **Secret** to your `.env` file

#### For Production (Live):

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to "Apps & Credentials"
3. Switch to **"Live"** tab at the top
4. Click "Create App"
5. Name your app (e.g., "Story Frames")
6. Copy the **Client ID** and **Secret** to your `.env` file
7. **Important**: Update `PAYPAL_MODE=live` in `.env`

### 4. Run the Server

#### Local Development:

```bash
npm start
```

The server will start on `http://localhost:3000`

#### Testing the Server:

```bash
# Check if server is running
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mode": "sandbox",
  "timestamp": "2026-02-07T22:30:00.000Z"
}
```

## API Endpoints

### GET /api/health

Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "ok",
  "mode": "sandbox",
  "timestamp": "2026-02-07T22:30:00.000Z"
}
```

---

### POST /api/create-order

Creates a PayPal order with cart and customer details.

**Request Body:**
```json
{
  "cart": [
    {
      "name": "Premium Digital Frame",
      "price": "49.99",
      "quantity": 1,
      "description": "Premium framed photo"
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Sofia",
    "postalCode": "1000",
    "countryCode": "BG"
  }
}
```

**Response:**
```json
{
  "orderID": "5O190127TN364715T"
}
```

**Errors:**
- `400 Bad Request`: Invalid cart or customer data
- `500 Internal Server Error`: PayPal API error

---

### POST /api/capture-order

Captures a PayPal order after user approves payment.

**Request Body:**
```json
{
  "orderID": "5O190127TN364715T",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "orderID": "5O190127TN364715T",
  "status": "COMPLETED",
  "payer": {
    "email_address": "john@example.com",
    "name": {
      "given_name": "John",
      "surname": "Doe"
    }
  },
  "purchase_units": [...]
}
```

**Errors:**
- `400 Bad Request`: Missing order ID
- `500 Internal Server Error`: PayPal capture failed

## Deployment

### Option 1: Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Create a new Heroku app:
```bash
heroku create storyframes-backend
```

3. Set environment variables:
```bash
heroku config:set PAYPAL_MODE=live
heroku config:set PAYPAL_CLIENT_ID=your_live_client_id
heroku config:set PAYPAL_CLIENT_SECRET=your_live_client_secret
heroku config:set FRONTEND_URL=https://mystoryframes.shop
```

4. Deploy:
```bash
cd backend
git init
heroku git:remote -a storyframes-backend
git add .
git commit -m "Initial backend deploy"
git push heroku main
```

5. Update frontend to use: `https://storyframes-backend.herokuapp.com`

---

### Option 2: Railway

1. Sign up at [Railway](https://railway.app/)

2. Create a new project and connect your GitHub repository

3. Add a new service and select the `backend` directory

4. Set environment variables in Railway dashboard:
   - `PAYPAL_MODE=live`
   - `PAYPAL_CLIENT_ID=your_live_client_id`
   - `PAYPAL_CLIENT_SECRET=your_live_client_secret`
   - `FRONTEND_URL=https://mystoryframes.shop`

5. Deploy automatically on git push

6. Use the provided Railway URL in your frontend

---

### Option 3: Vercel (Serverless)

1. Install [Vercel CLI](https://vercel.com/download)

2. Create `vercel.json` in backend folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

3. Deploy:
```bash
cd backend
vercel
```

4. Set environment variables in Vercel dashboard

5. Use the provided Vercel URL in your frontend

---

### Option 4: DigitalOcean App Platform

1. Sign up at [DigitalOcean](https://www.digitalocean.com/)

2. Create a new App and connect your GitHub repository

3. Select the `backend` folder

4. Set environment variables in the App Platform dashboard

5. Deploy automatically

6. Use the provided App Platform URL

---

### Option 5: VPS (Manual)

If deploying to a VPS (Ubuntu/Debian):

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
cd /var/www
git clone your-repo
cd storyframes/backend
npm install

# Setup PM2 for process management
sudo npm install -g pm2
pm2 start server.js --name storyframes-backend
pm2 startup
pm2 save

# Setup Nginx reverse proxy (optional)
sudo apt-get install nginx
# Configure nginx to proxy to localhost:3000
```

## Security Considerations

1. **Never commit `.env` file** - It contains your PayPal secret
2. **Use environment variables** - Never hardcode credentials
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Restrict CORS** - Set `FRONTEND_URL` to your actual domain
5. **Monitor logs** - Check for suspicious activity
6. **Keep dependencies updated** - Run `npm audit` regularly

## Troubleshooting

### Issue: "PAYPAL_CLIENT_ID is not defined"

**Solution:** Make sure you created `.env` file from `.env.example` and filled in your credentials.

### Issue: "CORS error from frontend"

**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend domain exactly.

### Issue: "PayPal API error: Authentication failed"

**Solution:** 
- Check that your Client ID and Secret are correct
- Verify you're using the right credentials for the mode (sandbox vs live)
- Make sure your PayPal app is enabled in the dashboard

### Issue: "Cannot capture order"

**Solution:**
- The order might have already been captured
- The order might have expired (30 days)
- Check PayPal dashboard for order status

### Issue: Server won't start

**Solution:**
- Check that port 3000 is not already in use
- Run `npm install` to ensure all dependencies are installed
- Check logs for specific error messages

## Switching to Production

When you're ready to go live:

1. **Get Live PayPal Credentials**:
   - Go to PayPal Developer Dashboard
   - Switch to "Live" tab
   - Create a Live app
   - Copy Live Client ID and Secret

2. **Update `.env`**:
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   ```

3. **Update Frontend**:
   - Update backend URL in `checkout.html`
   - Test with small payment first

4. **Test Thoroughly**:
   - Make a real test payment with a small amount
   - Verify order capture works
   - Check PayPal dashboard shows the transaction

5. **Monitor**:
   - Check server logs regularly
   - Monitor PayPal dashboard for payments
   - Set up alerts for errors

## Support

For issues or questions:
- Email: Sviievmla@gmail.com
- PayPal Developer Support: https://developer.paypal.com/support/

## License

MIT
