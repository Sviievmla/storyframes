# Render Deployment Guide for Story Frames Backend

This guide provides step-by-step instructions for deploying the Story Frames payment backend on Render.

## Prerequisites

- GitHub account with the Story Frames repository
- Render account (free tier available at https://render.com)
- PayPal Business account with live API credentials
- SMTP credentials for email notifications (Gmail, SendGrid, or Mailgun)

## Step 1: Prepare Your Repository

1. Ensure all backend files are committed to your GitHub repository:
   - `server.js`
   - `package.json`
   - `utils/` directory with all utility modules
   - `.env.example` (for reference, never commit `.env`)

2. Verify `.gitignore` excludes sensitive files:
   ```
   node_modules/
   .env
   .env.local
   logs/
   ```

## Step 2: Create PostgreSQL Database on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure your database:
   - **Name**: `storyframes-db`
   - **Database**: `storyframes`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users (e.g., Frankfurt for EU)
   - **Plan**: Free tier or paid based on needs
4. Click **"Create Database"**
5. Wait for database to be created (takes 1-2 minutes)
6. **Important**: Copy the **"Internal Database URL"** - you'll need this

## Step 3: Create Web Service on Render

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Select the `Sviievmla/storyframes` repository
   - Grant necessary permissions

3. Configure the web service:

   **Basic Settings:**
   - **Name**: `storyframes-backend`
   - **Region**: Same as database (e.g., Frankfurt)
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: Leave empty (uses repository root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Free tier for testing
   - Starter ($7/month) or higher for production

4. Click **"Create Web Service"** (don't worry about env vars yet)

## Step 4: Configure Environment Variables

After service is created, go to **"Environment"** tab and add these variables:

### Required Variables:

```bash
# Node Environment
NODE_ENV=production
PORT=10000

# PayPal LIVE Credentials (see PAYPAL-LIVE-SETUP.md)
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_secret
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id

# Database (use Internal Database URL from Step 2)
DATABASE_URL=postgres://user:password@host/database

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@mystoryframes.shop
ADMIN_EMAIL=Sviievmla@gmail.com

# Frontend URL
FRONTEND_URL=https://mystoryframes.shop
```

### Setting Environment Variables:

1. Click **"Environment"** tab in your web service
2. Click **"Add Environment Variable"** for each variable
3. Enter **Key** and **Value**
4. Click **"Save Changes"**

**Important**: Never use quotes around values in Render's environment variables.

## Step 5: Deploy and Verify

1. Render will automatically deploy after saving environment variables
2. Monitor the deployment logs in **"Logs"** tab
3. Wait for deployment to complete (usually 2-5 minutes)
4. Look for success message: `🚀 Story Frames Checkout Server running on port 10000`

### Verify Deployment:

Test your deployment with these endpoints:

```bash
# Health check (should return status: ok)
curl https://storyframes-backend.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-02-10T...",
  "environment": "production",
  "paypalConfigured": true,
  "databaseConnected": true,
  "emailConfigured": true
}
```

## Step 6: Configure Custom Domain (Optional)

If you want a custom domain like `api.mystoryframes.shop`:

1. Go to **"Settings"** tab in your web service
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain: `api.mystoryframes.shop`
5. Add the CNAME record to your DNS provider:
   ```
   CNAME api storyframes-backend.onrender.com
   ```
6. Wait for DNS propagation (5-60 minutes)
7. Render will automatically provision SSL certificate

## Step 7: Update Frontend

Update your frontend (`checkout.html`) to use the Render backend URL:

```javascript
// In checkout.html, add this before other scripts:
<script>
  window.BACKEND_URL = 'https://storyframes-backend.onrender.com';
</script>
```

Or use your custom domain:
```javascript
<script>
  window.BACKEND_URL = 'https://api.mystoryframes.shop';
</script>
```

## Step 8: Configure PayPal Webhooks

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Select your **Live** app
3. Click **"Add Webhook"**
4. Webhook URL: `https://storyframes-backend.onrender.com/api/paypal/webhook`
5. Select events to listen to:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `CHECKOUT.ORDER.APPROVED`
6. Save and copy the **Webhook ID**
7. Add `PAYPAL_WEBHOOK_ID` to Render environment variables

## Step 9: Test Production Payment

1. Visit your website: `https://mystoryframes.shop`
2. Add products to cart
3. Go to checkout
4. Use a real payment method (small amount like €1)
5. Complete the payment
6. Verify:
   - Payment appears in PayPal account
   - Order is saved in database
   - Confirmation email is received
   - Admin notification is received

## Monitoring and Maintenance

### Check Logs:
- Go to **"Logs"** tab in Render dashboard
- Monitor for errors or issues
- Look for successful payment confirmations

### Database Management:
- Use Render's **"Shell"** tab to access database
- Or connect with a PostgreSQL client using the External Database URL
- Example: `psql postgres://user:password@host/database`

### View Database Contents:
```sql
-- Connect via Render Shell or psql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
SELECT * FROM refunds ORDER BY created_at DESC LIMIT 10;
```

### Set up Alerts:
1. In Render dashboard, go to **"Settings"** → **"Notifications"**
2. Add email for deployment failures
3. Monitor disk usage and service health

## Scaling

### Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

### Upgrade to Paid:
For production use, upgrade to **Starter** plan ($7/month):
- Always running (no spin-down)
- Faster response times
- More CPU and memory
- Better for real customer traffic

## Troubleshooting

### Issue: "PayPal credentials not configured"
**Solution**: Verify environment variables are set correctly in Render dashboard

### Issue: "Database connection failed"
**Solution**: 
- Check DATABASE_URL is correct
- Ensure database and web service are in same region
- Use **Internal Database URL**, not External

### Issue: "Email service not configured"
**Solution**: 
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check SMTP_HOST and SMTP_PORT are correct

### Issue: Service won't start
**Solution**:
- Check logs for specific error
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Issue: CORS errors from frontend
**Solution**:
- Ensure FRONTEND_URL is set correctly
- Check allowed origins in server.js
- Verify custom domain is configured properly

## Backup and Recovery

### Database Backups:
- Render automatically backs up paid PostgreSQL databases
- For free tier, consider manual backups
- Export database: `pg_dump -d DATABASE_URL > backup.sql`

### Manual Backup Script:
```bash
# Run from Render Shell or local with connection string
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Cost Estimate

### Minimal Setup (Free):
- Web Service: Free tier ($0)
- PostgreSQL: Free tier ($0)
- **Total**: $0/month
- **Limitation**: Service spins down, slower response

### Production Setup:
- Web Service: Starter ($7/month)
- PostgreSQL: Starter ($7/month)
- PayPal fees: 2.9% + €0.35 per transaction
- **Total**: ~$14/month + transaction fees

## Security Checklist

- [ ] Using LIVE PayPal credentials (not sandbox)
- [ ] All environment variables set correctly
- [ ] DATABASE_URL uses Internal URL
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Admin email notifications working
- [ ] Database backups enabled/scheduled
- [ ] **IMPORTANT**: Webhook signature verification configured (see note below)

### ⚠️ Webhook Security Note

The current webhook implementation has **basic security** and should be enhanced before heavy production use:

**Current State**: Webhook signature verification is not fully implemented. The system checks for required headers but does not verify the cryptographic signature.

**For Production**: Consider one of these options:
1. **Recommended**: Use a PayPal webhook verification library
2. **Manual**: Implement full signature verification per [PayPal docs](https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#link-verifysignature)
3. **IP Filtering**: Restrict webhook endpoint to PayPal IPs at firewall level

**Risk**: Without proper verification, malicious actors could potentially send fake webhook events. However, this is **mitigated** by:
- All payment creation/capture goes through PayPal directly
- Webhooks only update status, don't process payments
- Database stores authoritative payment data from PayPal API
- Email notifications can be cross-checked with PayPal dashboard

**Recommendation**: The current implementation is sufficient for initial launch, but plan to enhance webhook security within 1-3 months of production use.

## Next Steps

1. Monitor first few live transactions closely
2. Test refund process
3. Set up regular database backups
4. Configure monitoring/alerting
5. Review logs weekly for issues
6. Update documentation as needed

## Support

- **Render Support**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **PayPal Developer**: https://developer.paypal.com/support/
- **Story Frames**: Sviievmla@gmail.com

## Additional Resources

- Render Documentation: https://render.com/docs
- Node.js on Render: https://render.com/docs/deploy-node-express-app
- PostgreSQL on Render: https://render.com/docs/databases
- Environment Variables: https://render.com/docs/environment-variables
