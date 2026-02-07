# Quick Start Guide: Production Deployment

This guide will help you deploy the Story Frames checkout system to production in under 30 minutes.

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ PayPal Business Account
- ✅ Node.js 14+ installed (for local testing)
- ✅ Deployment platform account (Heroku, Railway, Vercel, etc.)
- ✅ GitHub repository access
- ✅ Text editor for updating configuration

## Step 1: Get PayPal Live Credentials (5 minutes)

1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click **"Apps & Credentials"** in the left menu
3. Switch to **"Live"** tab at the top
4. Click **"Create App"**
5. Enter app name: `Story Frames Production`
6. Click **"Create App"**
7. Copy your **Client ID** and **Secret** - save them securely!

**⚠️ Important**: Never share your PayPal Client Secret or commit it to Git!

## Step 2: Deploy Backend Server (10 minutes)

Choose your preferred platform:

### Option A: Railway (Recommended - Easiest)

1. Sign up at [Railway.app](https://railway.app/)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `Sviievmla/storyframes` repository
4. Click **"Add variables"** and set:
   ```
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=<your_live_client_id>
   PAYPAL_CLIENT_SECRET=<your_live_client_secret>
   PORT=3000
   FRONTEND_URL=https://mystoryframes.shop
   ```
5. Railway will automatically detect the backend and deploy
6. Copy your backend URL (e.g., `https://storyframes-backend.up.railway.app`)

### Option B: Heroku

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
cd backend
heroku create storyframes-backend

# Set environment variables
heroku config:set PAYPAL_MODE=live
heroku config:set PAYPAL_CLIENT_ID=<your_live_client_id>
heroku config:set PAYPAL_CLIENT_SECRET=<your_live_client_secret>
heroku config:set FRONTEND_URL=https://mystoryframes.shop

# Deploy
git subtree push --prefix backend heroku main
```

Your backend URL: `https://storyframes-backend.herokuapp.com`

### Option C: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd backend
vercel --prod

# Add environment variables in Vercel dashboard:
# https://vercel.com/your-username/storyframes-backend/settings/environment-variables
```

## Step 3: Update Frontend Configuration (2 minutes)

1. Open `checkout.html` in your text editor
2. Find line **~609** (search for `BACKEND_URL`)
3. Update to your deployed backend URL:

```javascript
// BEFORE (local development)
const BACKEND_URL = 'http://localhost:3000';

// AFTER (production)
const BACKEND_URL = 'https://storyframes-backend.up.railway.app';
// OR
const BACKEND_URL = 'https://storyframes-backend.herokuapp.com';
// OR
const BACKEND_URL = 'https://your-backend.vercel.app';
```

4. Save the file
5. Commit and push to GitHub:
```bash
git add checkout.html
git commit -m "Update backend URL for production"
git push origin main
```

## Step 4: Update PayPal SDK (Optional, 2 minutes)

For consistency, update the PayPal SDK in `checkout.html` line **~51** with your **Live Client ID**:

```html
<!-- BEFORE (sandbox) -->
<script src="https://www.paypal.com/sdk/js?client-id=AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUed2TK-uhjVCt_b&currency=EUR&intent=capture&enable-funding=card"></script>

<!-- AFTER (production) -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=EUR&intent=capture&enable-funding=card"></script>
```

**Note**: This step is optional since actual payment processing happens server-side. However, it's recommended for consistency.

## Step 5: Test Your Production Setup (10 minutes)

### 5.1 Test Backend Health

```bash
curl https://your-backend-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mode": "live",
  "timestamp": "2026-02-07T22:30:00.000Z"
}
```

### 5.2 Test Checkout Flow

1. Visit your live site: `https://mystoryframes.shop`
2. Add a product to cart
3. Go to checkout page
4. Fill in real customer details
5. Select PayPal payment method
6. **Make a test payment with a SMALL amount** (€1.00 recommended)
7. Complete payment with your real PayPal account
8. Verify:
   - ✅ Payment goes through
   - ✅ Success modal appears
   - ✅ Cart is cleared
   - ✅ Order appears in [PayPal Dashboard](https://www.paypal.com/activity)

### 5.3 Common Issues & Solutions

**Issue**: CORS error when clicking PayPal button

**Solution**: Verify `FRONTEND_URL` in backend `.env` matches your exact frontend domain (including https://)

**Issue**: Payment fails with "Authentication failed"

**Solution**: 
- Check PayPal credentials are correct
- Ensure you're using **Live** credentials, not Sandbox
- Verify `PAYPAL_MODE=live` is set

**Issue**: Backend returns 500 error

**Solution**: Check backend logs for detailed error messages:
- Railway: Click your project → "Deployments" → "View Logs"
- Heroku: `heroku logs --tail --app storyframes-backend`
- Vercel: Go to project → "Deployments" → Click deployment → "Functions" tab

## Step 6: Monitor Your Deployment

### Daily Checks (First Week)

1. **Check PayPal Dashboard**: [https://www.paypal.com/activity](https://www.paypal.com/activity)
   - Verify transactions are appearing
   - Check for any disputes or issues

2. **Check Backend Logs**:
   - Railway: Dashboard → Deployments → Logs
   - Heroku: `heroku logs --tail`
   - Vercel: Dashboard → Functions → Logs

3. **Test Checkout Flow**: Make a small test purchase every few days

### Set Up Alerts (Recommended)

1. **PayPal Email Notifications**:
   - Go to PayPal Settings → Notifications
   - Enable email alerts for transactions

2. **Backend Monitoring**:
   - Railway: Built-in metrics
   - Heroku: Add "Logentries" addon for alerts
   - Vercel: Built-in analytics

3. **Uptime Monitoring**:
   - Use [UptimeRobot](https://uptimerobot.com/) (free)
   - Monitor: `https://your-backend.com/api/health`
   - Alert if backend goes down

## Troubleshooting

### Backend Won't Start

```bash
# Check environment variables are set
heroku config --app storyframes-backend
# OR for Railway: Check dashboard → Variables

# Check logs
heroku logs --tail --app storyframes-backend
```

### Payments Not Processing

1. Verify PayPal credentials in backend environment variables
2. Check `PAYPAL_MODE=live` (not `sandbox`)
3. Ensure backend URL is correct in `checkout.html`
4. Check CORS settings match your domain

### Cart Not Clearing After Payment

1. Check browser console for JavaScript errors
2. Verify success modal appears
3. Check localStorage in browser DevTools

## Security Checklist

Before going live, verify:

- ✅ Backend `.env` file is in `.gitignore`
- ✅ PayPal Client Secret is NEVER committed to Git
- ✅ HTTPS enabled for both frontend and backend
- ✅ CORS `FRONTEND_URL` set to your exact domain
- ✅ Backend environment variables are set on deployment platform
- ✅ PayPal webhooks configured (optional, for advanced order tracking)

## Going Live Checklist

- [ ] PayPal Live credentials obtained
- [ ] Backend deployed with live credentials
- [ ] Frontend updated with production backend URL
- [ ] Test purchase completed successfully
- [ ] Order appears in PayPal dashboard
- [ ] Email notifications working
- [ ] Monitoring/alerts set up
- [ ] Documentation reviewed
- [ ] Team trained on order management

## Support Resources

- **PayPal Developer Support**: [https://developer.paypal.com/support/](https://developer.paypal.com/support/)
- **Backend README**: `backend/README.md`
- **Checkout Documentation**: `CHECKOUT-README.md`
- **Store Owner Email**: Sviievmla@gmail.com

## Next Steps After Launch

1. **Monitor for 1 week**: Check logs and transactions daily
2. **Optimize**: Add analytics tracking for conversion rates
3. **Enhance**: Consider adding:
   - Automated email confirmations (SendGrid/Mailgun)
   - Order management dashboard
   - Inventory tracking
   - Customer accounts
4. **Scale**: As orders increase, consider upgrading hosting plan

---

🎉 **Congratulations!** Your production checkout system is now live and ready to process real payments!

For questions or issues, contact: **Sviievmla@gmail.com**
