# Deployment Guide - Story Frames Checkout

## Quick Start for Production

### Prerequisites
- Node.js v14+ installed
- PayPal Business account with live API credentials
- Web hosting with Node.js support (e.g., Heroku, Railway, Render, DigitalOcean)

### Step 1: Get PayPal Live Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Switch to the **Live** tab (top right)
3. Click **"Create App"**
4. Give your app a name (e.g., "Story Frames Live")
5. Copy the **Client ID** and **Secret**

### Step 2: Configure Environment Variables

Set these environment variables in your hosting platform:

```bash
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_secret_here
PAYPAL_API_BASE=https://api-m.paypal.com
PORT=3000
NODE_ENV=production
```

**Important:** Use `https://api-m.paypal.com` (NOT sandbox) for live payments.

### Step 3: Deploy

#### Option A: Heroku
```bash
heroku create your-app-name
heroku config:set PAYPAL_CLIENT_ID=your_live_client_id
heroku config:set PAYPAL_CLIENT_SECRET=your_live_secret
heroku config:set PAYPAL_API_BASE=https://api-m.paypal.com
heroku config:set NODE_ENV=production
git push heroku main
```

#### Option B: Railway
1. Connect your GitHub repository
2. Add environment variables in the Railway dashboard
3. Railway automatically deploys on push

#### Option C: Render
1. Create a new Web Service
2. Connect your GitHub repository
3. Set environment variables in settings
4. Render auto-deploys on push

### Step 4: Test Live Payment

1. Navigate to your live site's checkout page
2. Add a test product to cart
3. Complete checkout with a real payment method
4. Verify payment appears in your PayPal account
5. Test the order confirmation flow

### Step 5: Monitor

- Check server logs for errors
- Monitor PayPal dashboard for transactions
- Test email notifications
- Verify mobile responsiveness

## Security Checklist

- [ ] HTTPS enabled (required for production)
- [ ] Environment variables configured (never commit credentials)
- [ ] PayPal live credentials (not sandbox) configured
- [ ] `.env` file in `.gitignore`
- [ ] CORS restricted to your domain (optional but recommended)
- [ ] Server logs reviewed for sensitive data leaks
- [ ] Rate limiting configured (optional but recommended)

## Testing Checklist

- [ ] Can add items to cart
- [ ] Cart persists across page loads
- [ ] Form validation works (required fields)
- [ ] PayPal payment completes successfully
- [ ] Credit card payment works (via PayPal)
- [ ] COD works for Bulgaria orders
- [ ] Order confirmation modal displays
- [ ] Email notification opens correctly
- [ ] Mobile layout is responsive
- [ ] Payment section visible above fold
- [ ] Trust badges display correctly
- [ ] Language switcher works (EN/BG)

## Rollback Plan

If issues occur in production:

1. Revert to previous deployment via your hosting platform
2. Check server logs for error details
3. Verify PayPal credentials are correct
4. Test in local environment first
5. Re-deploy after fixing issues

## Support

For deployment issues:
- Check README.md for detailed documentation
- Review server logs for errors
- Contact hosting platform support
- Check PayPal Developer Dashboard for API errors

## Cost Estimate

- **Hosting**: $5-25/month (Railway, Render, Heroku Hobby)
- **PayPal Fees**: 2.9% + €0.35 per transaction (standard rates)
- **Domain**: $10-15/year (optional, if not using subdomain)

Total: ~$60-300/year depending on transaction volume
