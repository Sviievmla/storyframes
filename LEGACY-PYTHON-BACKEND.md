# Legacy Python Backend Files

This directory contains the legacy Python/FastAPI backend implementation that has been replaced by the unified Node.js/Express backend (`server.js`).

## Files

- `main.py` - FastAPI application (legacy)
- `paypal_client.py` - PayPal client configuration (legacy)
- `paypal_pay.py` - PayPal payment functions (legacy)
- `requirements.txt` - Python dependencies (legacy)

## Migration Notice

**These files are deprecated and should not be used.**

The application now uses a unified Node.js backend (`server.js`) that provides:
- ✅ Complete PayPal integration (create order + capture payment)
- ✅ Email notification system
- ✅ Input validation and error handling
- ✅ Works seamlessly with checkout.html frontend

## Using the New Backend

Instead of the Python backend, use:

```bash
npm install
npm start
```

See [BACKEND-README.md](./BACKEND-README.md) for complete documentation.

## Why the Change?

The Python backend was incomplete:
1. Expected `product_id` instead of `cart` and `total`
2. No email notification system
3. Mismatch with frontend expectations
4. Incomplete error handling

The new Node.js backend addresses all these issues and is production-ready.

---

**Note**: These files are kept for reference but may be removed in future versions.
