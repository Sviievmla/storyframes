# Database Setup Guide

This guide explains the PostgreSQL database structure for Story Frames payment backend.

## Database Schema

The backend uses two main tables: `orders` and `refunds`.

### Orders Table

Stores all payment orders:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  cart_items TEXT,
  customer_info TEXT,
  capture_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  captured_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_paypal_id ON orders(paypal_order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Columns**:
- `id`: Auto-incrementing primary key
- `paypal_order_id`: PayPal's unique order ID (e.g., "5O190127TN364715T")
- `amount`: Order total amount (e.g., 49.99)
- `currency`: Currency code (EUR, USD, etc.)
- `status`: Order status (CREATED, APPROVED, COMPLETED, FAILED, DENIED)
- `cart_items`: JSON string of items purchased
- `customer_info`: JSON string of customer details
- `capture_data`: Full PayPal capture response (JSON)
- `created_at`: When order was created
- `captured_at`: When payment was captured
- `updated_at`: Last update timestamp

### Refunds Table

Stores all refund transactions:

```sql
CREATE TABLE refunds (
  id SERIAL PRIMARY KEY,
  refund_id VARCHAR(255) UNIQUE NOT NULL,
  capture_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  refund_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refunds_refund_id ON refunds(refund_id);
CREATE INDEX idx_refunds_capture_id ON refunds(capture_id);
```

**Columns**:
- `id`: Auto-incrementing primary key
- `refund_id`: PayPal's unique refund ID
- `capture_id`: Associated capture/payment ID
- `amount`: Refund amount (NULL for full refund)
- `status`: Refund status (PENDING, COMPLETED, FAILED)
- `refund_data`: Full PayPal refund response (JSON)
- `created_at`: When refund was initiated
- `updated_at`: Last update timestamp

## Automatic Table Creation

The backend automatically creates tables on first startup:

1. Server starts
2. Connects to PostgreSQL using `DATABASE_URL`
3. Runs CREATE TABLE IF NOT EXISTS queries
4. Creates indexes
5. Ready to accept requests

No manual SQL execution required!

## Manual Database Setup (Optional)

If you prefer to set up tables manually:

### Using Render Dashboard:

1. Go to your PostgreSQL database in Render
2. Click **"Shell"** tab (or "Connect")
3. Run the following SQL:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  cart_items TEXT,
  customer_info TEXT,
  capture_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  captured_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id SERIAL PRIMARY KEY,
  refund_id VARCHAR(255) UNIQUE NOT NULL,
  capture_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  refund_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_paypal_id ON orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create indexes for refunds
CREATE INDEX IF NOT EXISTS idx_refunds_refund_id ON refunds(refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_capture_id ON refunds(capture_id);
```

### Using psql Command Line:

```bash
# Connect to database
psql "postgres://user:password@host:5432/database"

# Then run the SQL above
```

## Querying the Database

### View Recent Orders:

```sql
SELECT 
  id,
  paypal_order_id,
  amount,
  currency,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Specific Order:

```sql
SELECT * FROM orders 
WHERE paypal_order_id = '5O190127TN364715T';
```

### View Orders by Status:

```sql
SELECT 
  paypal_order_id,
  amount,
  currency,
  status,
  created_at
FROM orders 
WHERE status = 'COMPLETED'
ORDER BY created_at DESC;
```

### View Total Revenue:

```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(amount) as total_revenue,
  currency
FROM orders 
WHERE status = 'COMPLETED'
GROUP BY currency;
```

### View Recent Refunds:

```sql
SELECT 
  r.refund_id,
  r.capture_id,
  r.amount,
  r.status,
  r.created_at,
  o.paypal_order_id
FROM refunds r
LEFT JOIN orders o ON r.capture_id = o.capture_data::json->>'id'
ORDER BY r.created_at DESC
LIMIT 10;
```

## Database Maintenance

### Backup Database:

**Using Render Dashboard:**
- Paid plans have automatic backups
- Free tier: No automatic backups

**Manual Backup:**
```bash
# Get External Database URL from Render
pg_dump "postgres://user:password@host/database" > backup.sql
```

**Restore from Backup:**
```bash
psql "postgres://user:password@host/database" < backup.sql
```

### Clean Old Data (Optional):

If you want to archive or delete old orders:

```sql
-- Archive orders older than 1 year
CREATE TABLE orders_archive AS 
SELECT * FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete archived orders (careful!)
DELETE FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Database Monitoring

### Check Connection:

```sql
SELECT version();
SELECT current_database();
```

### Check Table Sizes:

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Record Counts:

```sql
SELECT 
  'orders' as table_name,
  COUNT(*) as record_count
FROM orders
UNION ALL
SELECT 
  'refunds' as table_name,
  COUNT(*) as record_count
FROM refunds;
```

## Database Security

### Best Practices:

1. **Use Internal Database URL** in Render
   - Internal URL: Only accessible within Render network
   - External URL: Accessible from internet (use with caution)

2. **Environment Variables**
   - Never hardcode database credentials
   - Use `DATABASE_URL` environment variable
   - Never commit credentials to Git

3. **SSL Connection**
   - Backend automatically uses SSL in production
   - Render provides SSL by default

4. **Access Control**
   - Limit database access to necessary services only
   - Use Render's built-in firewall
   - Don't expose database publicly

## Troubleshooting

### Issue: "Database connection failed"

**Solution**:
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue: "Tables don't exist"

**Solution**:
- Ensure backend started successfully
- Check logs for table creation errors
- Manually create tables using SQL above

### Issue: "Too many connections"

**Solution**:
- Backend uses connection pooling (max 20)
- Increase database plan if needed
- Check for connection leaks in logs

### Issue: "Slow queries"

**Solution**:
- Indexes are created automatically
- For large datasets, consider adding more indexes
- Upgrade database plan for better performance

## Database Migration

If you need to add new columns or tables in the future:

### Example: Add a new column

```sql
ALTER TABLE orders 
ADD COLUMN shipping_info TEXT;
```

### Example: Create new table

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Data Privacy and GDPR

If you operate in EU:

1. **Customer Data**:
   - Store only necessary information
   - Implement data retention policies
   - Allow customer data deletion requests

2. **Data Deletion**:
```sql
-- Delete customer data for specific order
UPDATE orders 
SET customer_info = NULL 
WHERE paypal_order_id = 'ORDER_ID';
```

3. **Data Export**:
```sql
-- Export customer's orders
SELECT * FROM orders 
WHERE customer_info::json->>'email' = 'customer@example.com';
```

## API Endpoints for Database Access

The backend provides API endpoints to access database:

### Get Orders:
```
GET /api/orders?page=1&limit=50&status=COMPLETED
```

### Get Specific Order:
```
GET /api/orders/5O190127TN364715T
```

Response includes all order details from database.

## Support

For database issues:
- **Render Support**: https://render.com/docs/databases
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Story Frames**: Sviievmla@gmail.com
