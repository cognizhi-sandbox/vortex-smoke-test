-- Pet Store Application Schema for Vite/Nitro/SQLite
-- Extracted from legacy J2EE application (SX-0002)
-- Target stack: SQLite via better-sqlite3 + Drizzle ORM

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    auth_method TEXT NOT NULL DEFAULT 'FORM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    tier TEXT NOT NULL DEFAULT 'STANDARD' CHECK (tier IN ('STANDARD', 'PLATINUM')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SHIPPED', 'FULFILLED', 'FAILED', 'CANCELLED')),
    total_amount DECIMAL(10, 2) NOT NULL,
    item_count INTEGER NOT NULL CHECK (item_count >= 0),
    shipping_cost DECIMAL(10, 2) NOT NULL,
    requires_approval INTEGER NOT NULL DEFAULT 0 CHECK (requires_approval IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    sku TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TABLE credit_cards (
    card_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    number_last_four TEXT NOT NULL,
    brand TEXT NOT NULL CHECK (brand IN ('Visa', 'Mastercard')),
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE INDEX idx_credit_cards_customer_id ON credit_cards(customer_id);

CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    card_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED')),
    authorization_timestamp TIMESTAMP,
    settlement_timestamp TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES credit_cards(card_id)
);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_settlement_timestamp ON transactions(settlement_timestamp);

CREATE TABLE refunds (
    refund_id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'FAILED')),
    days_since_settlement INTEGER NOT NULL CHECK (days_since_settlement >= 0),
    eligible INTEGER NOT NULL DEFAULT 0 CHECK (eligible IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
);

CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_eligible ON refunds(eligible);
CREATE INDEX idx_refunds_created_at ON refunds(created_at);

-- Business Rule Constraints (enforced via application logic)
-- Order Approval Threshold: orders >= $5000 require approval (or $10k for Platinum)
-- Free Shipping: orders >= $75 have shipping_cost = 0
-- Shipping Formula: orders < $75 have shipping_cost = 4.95 + (item_count * 0.75)
-- Cancellation: only PENDING and APPROVED orders can be cancelled
-- Refund Window: refunds only eligible if days_since_settlement <= 90
