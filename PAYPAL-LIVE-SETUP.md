# PayPal Live Setup Guide

This guide walks you through setting up PayPal for live production payments on Story Frames.

## Prerequisites

- PayPal Business account (not personal account)
- Business verification completed
- Bank account or credit card linked to PayPal account

## Step 1: Create PayPal Business Account

If you don't have a PayPal Business account:

1. Go to https://www.paypal.com/
2. Click **"Sign Up"** → **"Business Account"**
3. Fill in business details:
   - Business name: "Story Frames" (or your business name)
   - Business type: Select appropriate type
   - Business email: Your business email
4. Complete email verification
5. Link a bank account or credit card

### Business Verification:

PayPal may require additional verification:
- Government-issued ID
- Proof of business address
- Tax identification number
- Business registration documents

**Important**: Complete verification before processing live payments to avoid account limitations.

## Step 2: Access PayPal Developer Dashboard

1. Log in to your PayPal Business account
2. Go to https://developer.paypal.com/dashboard/
3. Log in with the same credentials (if prompted)

## Step 3: Switch to Live Environment

**Critical**: Make sure you're in the LIVE environment:

1. In the Developer Dashboard, look at the top-right corner
2. You'll see a toggle/dropdown: **"Sandbox"** vs **"Live"**
3. Click and select **"Live"**
4. The interface should indicate you're in **Live** mode

## Step 4: Create Live App

1. In **Live** mode, go to **"My Apps & Credentials"**
2. Under **"Live"** section (NOT Sandbox), click **"Create App"**
3. Fill in app details:
   - **App Name**: `Story Frames Production`
   - **App Type**: `Merchant`
4. Click **"Create App"**

## Step 5: Get Live API Credentials

After creating the app, you'll see:

1. **Client ID**: 
   - Long string starting with `A...`
   - Example: `AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF...`
   - **Copy this** - you'll need it for `PAYPAL_CLIENT_ID`

2. **Secret**: 
   - Click **"Show"** under Secret
   - Copy the secret key
   - **Copy this** - you'll need it for `PAYPAL_CLIENT_SECRET`

**Important**: 
- Never share these credentials publicly
- Never commit them to GitHub
- Store them securely (password manager recommended)
- Only use in production environment variables

## Step 6: Configure App Settings

While still in your app settings:

### 6.1 Return URLs (Optional but Recommended):

1. Scroll to **"App settings"**
2. Add **Return URL**: `https://mystoryframes.shop/checkout.html`
3. Add **Cancel URL**: `https://mystoryframes.shop/checkout.html`
4. Click **"Save"**

### 6.2 Enable Features:

Ensure these features are enabled:
- ✅ **Accept payments** - REQUIRED
- ✅ **Checkout** - REQUIRED  
- ✅ **Refund payments** - REQUIRED
- ✅ **Webhooks** - REQUIRED for notifications

## Step 7: Configure PayPal Webhooks

Webhooks notify your backend when payment events occur:

1. In your app page, scroll to **"Webhooks"**
2. Click **"Add Webhook"**
3. Webhook URL: Enter your backend URL
   ```
   https://storyframes-backend.onrender.com/api/paypal/webhook
   ```
   (or use your custom domain)

4. **Event types**: Select the following events:
   - ✅ `Checkout order approved` - CHECKOUT.ORDER.APPROVED
   - ✅ `Payment capture completed` - PAYMENT.CAPTURE.COMPLETED
   - ✅ `Payment capture denied` - PAYMENT.CAPTURE.DENIED  
   - ✅ `Payment capture refunded` - PAYMENT.CAPTURE.REFUNDED

5. Click **"Save"**

6. **Copy the Webhook ID**: You'll see it after saving
   - Format: `WH-xxx...`
   - Save this for `PAYPAL_WEBHOOK_ID` environment variable

## Step 8: Update Frontend PayPal Client ID

Update your `checkout.html` to use the LIVE Client ID:

### Current (Sandbox):
```html
<script src="https://www.paypal.com/sdk/js?client-id=AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUed2TK-uhjVCt_b&currency=EUR&intent=capture&enable-funding=card"></script>
```

### Update to (Live):
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID_HERE&currency=EUR&intent=capture&enable-funding=card"></script>
```

**Replace** `YOUR_LIVE_CLIENT_ID_HERE` with your actual live Client ID from Step 5.

**Keep these parameters**:
- `currency=EUR` - Your primary currency
- `intent=capture` - Immediate payment capture
- `enable-funding=card` - Allows credit/debit card payments

## Step 9: Set Environment Variables

### On Render:

1. Go to your Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Add/Update these variables:

```bash
PAYPAL_CLIENT_ID=your_live_client_id_from_step_5
PAYPAL_CLIENT_SECRET=your_live_secret_from_step_5
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id_from_step_7
```

5. Click **"Save Changes"**
6. Service will automatically redeploy

### Verify API Base URL:

**CRITICAL**: Ensure `PAYPAL_API_BASE` is set to:
```
https://api-m.paypal.com
```

**NOT** sandbox:
```
https://api-m.sandbox.paypal.com  ❌ WRONG for production
```

## Step 10: Test with Small Amount

Before going fully live, test with a small real payment:

1. Visit your website
2. Add a low-cost item (or test product)
3. Complete checkout with real payment method
4. Amount: €1.00 or similar small amount
5. Complete the payment

### Verify Test Payment:

1. **PayPal Account**: Check your PayPal business account
   - Payment should appear in **Activity**
   - Status should be "Completed"
   - Amount should match

2. **Database**: Check your Render database
   ```sql
   SELECT * FROM orders WHERE paypal_order_id = 'YOUR_ORDER_ID';
   ```

3. **Email**: Check if emails were sent
   - Customer confirmation email
   - Admin notification email

4. **Logs**: Check Render logs
   - Look for "Order captured successfully"
   - No error messages

## Step 11: Configure Payment Receiving Preferences

In your PayPal Business account:

1. Go to **Settings** (gear icon)
2. Click **"Payment Preferences"**
3. Configure:
   - **Block payments**: NO (allow all)
   - **Currency conversion**: Automatic or manual
   - **Payment receiving preferences**: Accept all supported currencies
   - **Payment buttons**: Allow

## Step 12: Set Up Refund Policy (Optional)

1. In PayPal account, go to **Settings**
2. Set your return/refund policy
3. Configure automatic refund settings if needed

## Multi-Currency Support

To accept multiple currencies beyond EUR:

1. In PayPal Business Settings
2. Go to **"Payment Preferences"** → **"Block Payments"**
3. Select **"Accept payments in any currency"**

### Update Frontend:

To let customers choose currency, update the PayPal SDK:

```html
<!-- Multiple currencies -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR&intent=capture&enable-funding=card"></script>
```

Supported currencies:
- EUR (Euro) - Default
- USD (US Dollar)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- And many more...

## Security Best Practices

### 1. Credential Protection:
- ✅ Never commit credentials to GitHub
- ✅ Use environment variables only
- ✅ Rotate secrets if compromised
- ✅ Use different credentials for sandbox and live

### 2. Monitor Transactions:
- ✅ Check PayPal account daily
- ✅ Review unusual transactions
- ✅ Set up PayPal alerts for large amounts

### 3. Webhook Security:
- ✅ Verify webhook signatures
- ✅ Use HTTPS only
- ✅ Validate all webhook data

### 4. Fraud Prevention:
- Enable PayPal's fraud protection
- Review suspicious orders
- Set up transaction limits if needed

## Transaction Fees

PayPal charges these fees (as of 2024):

**Standard Business Account**:
- 2.9% + €0.35 per transaction (EUR)
- International: Additional 1.5% currency conversion
- Micropayments: Different rate for <€10 transactions

**PayPal Checkout Fees**:
- Same as standard (2.9% + €0.35)
- No setup fee
- No monthly fee

### Example:
- Sale: €50.00
- PayPal fee: €1.80 (2.9% of €50 + €0.35)
- You receive: €48.20

## Troubleshooting

### Issue: "Account is not verified"
**Solution**: Complete PayPal business verification (ID, bank account, etc.)

### Issue: "Live credentials not working"
**Solution**: 
- Verify you copied credentials from **Live** tab (not Sandbox)
- Ensure no extra spaces in credentials
- Check PAYPAL_API_BASE is `https://api-m.paypal.com`

### Issue: "Payment captured but webhook not received"
**Solution**:
- Check webhook URL is correct and accessible
- Verify webhook is in Live environment
- Check Render logs for webhook requests
- Test webhook manually from PayPal dashboard

### Issue: "Client ID invalid"
**Solution**:
- Ensure you're using Live Client ID in frontend
- Check you didn't use Sandbox Client ID by mistake
- Verify client ID is from same PayPal account

### Issue: "Payment declined"
**Solution**:
- Check buyer's payment method is valid
- Ensure PayPal account can receive payments
- Verify account is not limited
- Check for sufficient funds

## Testing Checklist

Before going fully live:

- [ ] PayPal Business account verified
- [ ] Live app created in Developer Dashboard
- [ ] Live Client ID and Secret obtained
- [ ] Webhook configured with live URL
- [ ] Frontend updated with live Client ID
- [ ] Backend environment variables updated
- [ ] API base URL set to production (api-m.paypal.com)
- [ ] Test payment completed successfully (small amount)
- [ ] Payment appears in PayPal account
- [ ] Order saved in database
- [ ] Confirmation emails sent
- [ ] Webhook events received
- [ ] Refund test completed (optional but recommended)

## Going Live Checklist

- [ ] All testing complete and successful
- [ ] Real products/prices configured
- [ ] Payment receiving preferences set
- [ ] Refund policy configured
- [ ] Fraud settings reviewed
- [ ] Transaction monitoring set up
- [ ] Customer support prepared
- [ ] Backup payment method available (if needed)

## Monitoring and Maintenance

### Daily:
- Check PayPal account for new transactions
- Review any failed payments
- Monitor email notifications

### Weekly:
- Review transaction logs
- Check for unusual patterns
- Verify database and PayPal match

### Monthly:
- Reconcile PayPal with accounting
- Review fees and charges
- Update security if needed

## Support and Resources

### PayPal Support:
- Help Center: https://www.paypal.com/help
- Developer Support: https://developer.paypal.com/support/
- Phone: Available in PayPal account under "Help"

### Documentation:
- PayPal Checkout: https://developer.paypal.com/docs/checkout/
- PayPal REST API: https://developer.paypal.com/docs/api/
- Webhooks: https://developer.paypal.com/docs/api-basics/notifications/webhooks/

### Story Frames Support:
- Email: Sviievmla@gmail.com
- Documentation: See RENDER-DEPLOYMENT.md

## Rollback to Sandbox

If you need to revert to sandbox for testing:

1. In `.env` or Render environment variables:
   ```bash
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_secret
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   ```

2. In `checkout.html`:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=SANDBOX_CLIENT_ID&currency=EUR&intent=capture&enable-funding=card"></script>
   ```

3. Use PayPal Sandbox test accounts for testing

**Remember**: Never use sandbox in production!
