-- Legacy Petstore Database Schema
-- Extracted from J2EE application (SX-0003 spec extraction)
-- Target: SQLite (better-sqlite3 + Drizzle ORM)
-- Date: 2026-09-03

-- Customer table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'STANDARD' CHECK (tier IN ('STANDARD', 'PLATINUM')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_customers_email ON customers(email);

-- Product table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  current_price REAL NOT NULL CHECK (current_price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active);

-- Order table
-- Requirement: Order with total >= $5000 requires approval (standard tier)
-- Requirement: Order with total >= $10000 requires approval (platinum tier)
-- Requirement: Orders can be cancelled only in PENDING or APPROVED status
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  total REAL NOT NULL CHECK (total >= 0),
  shipping_cost REAL NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  tax REAL NOT NULL DEFAULT 0 CHECK (tax >= 0),
  grand_total REAL NOT NULL CHECK (grand_total >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'FULFILLED', 'SHIPPED', 'CANCELLED')),
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_deadline DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_requires_approval ON orders(requires_approval);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order item table (line items in order)
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Credit card table (PCI-compliant storage)
-- Requirement: Card validation requires:
--   1. Card number non-null and non-empty
--   2. Card number length >= 13 digits
--   3. Brand must be Visa (4) or Mastercard (5) only
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  card_number_last_four TEXT NOT NULL,
  brand TEXT NOT NULL CHECK (brand IN ('VISA', 'MASTERCARD', 'OTHER')),
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= 1900 AND expiry_year <= 2200),
  valid BOOLEAN NOT NULL DEFAULT FALSE,
  validated_at DATETIME,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_customer_id ON cards(customer_id);
CREATE INDEX idx_cards_brand ON cards(brand);
CREATE UNIQUE INDEX idx_cards_default ON cards(customer_id) WHERE is_default = TRUE;

-- Payment table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  card_id TEXT NOT NULL REFERENCES cards(id),
  amount REAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'AUTHORIZED', 'CAPTURED', 'DECLINED', 'REFUNDED')),
  gateway_ref TEXT,
  gateway_response TEXT,
  authorization_time DATETIME,
  settlement_time DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_card_id ON payments(card_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_settlement_time ON payments(settlement_time);

-- Refund table
-- Requirement: Refunds eligible within 90 days from settlement date
CREATE TABLE refunds (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  payment_id TEXT NOT NULL REFERENCES payments(id),
  amount REAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED')),
  reason TEXT,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settlement_date DATE,
  days_since_settlement INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN settlement_date IS NOT NULL
      THEN (julianday('now') - julianday(settlement_date))
      ELSE NULL
    END
  ) STORED,
  eligible BOOLEAN GENERATED ALWAYS AS (
    CASE
      WHEN days_since_settlement IS NOT NULL AND days_since_settlement <= 90
      THEN TRUE
      ELSE FALSE
    END
  ) STORED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_settlement_date ON refunds(settlement_date);
CREATE INDEX idx_refunds_eligible ON refunds(eligible);

-- Configuration table (for externalized business rules)
-- Used to store:
-- - Order approval thresholds (standard: $5000, platinum: $10000)
-- - Free shipping threshold ($75.00)
-- - Shipping charges (base: $4.95, per-item: $0.75)
-- - Refund window (90 days)
CREATE TABLE configuration (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Business rule configurations
INSERT OR IGNORE INTO configuration (key, value, description) VALUES
  ('order.approval.threshold.standard', '5000.00', 'Standard tier approval threshold (USD)'),
  ('order.approval.threshold.platinum', '10000.00', 'Platinum tier approval threshold (USD)'),
  ('shipping.free.threshold', '75.00', 'Free shipping threshold (USD) — orders at or above this amount ship free'),
  ('shipping.charged.base_fee', '4.95', 'Base shipping fee for charged orders (USD)'),
  ('shipping.charged.per_item_rate', '0.75', 'Per-item handling charge for charged orders (USD)'),
  ('refund.eligible.days', '90', 'Refund eligibility window from settlement date (days)'),
  ('payment.gateway.timeout.ms', '8000', 'Payment gateway timeout (milliseconds)');

-- Audit log table (for compliance and troubleshooting)
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  actor_id TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
