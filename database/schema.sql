-- ==========================================================
-- StockVault - Complete Database Schema
-- ==========================================================

CREATE DATABASE IF NOT EXISTS stockvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stockvault;

-- ----------------------------------------------------------
-- TABLE: users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  wallet_balance DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- TABLE: admins
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- TABLE: stocks
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  company_name       VARCHAR(150) NOT NULL,
  symbol             VARCHAR(20)  NOT NULL UNIQUE,
  current_price      DECIMAL(15,2) NOT NULL,
  previous_price     DECIMAL(15,2) NOT NULL,
  available_quantity INT NOT NULL DEFAULT 0,
  sector             VARCHAR(80),
  description        TEXT,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- TABLE: portfolios
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  stock_id      INT NOT NULL,
  quantity      INT NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(15,2) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_stock (user_id, stock_id),
  CONSTRAINT fk_portfolio_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_portfolio_stock FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- TABLE: transactions
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  stock_id     INT NOT NULL,
  type         ENUM('BUY','SELL') NOT NULL,
  quantity     INT NOT NULL,
  price        DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_txn_stock FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- TABLE: user_settings
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT NOT NULL UNIQUE,
  theme                ENUM('dark','light') NOT NULL DEFAULT 'dark',
  currency             ENUM('USD','INR') NOT NULL DEFAULT 'USD',
  language             VARCHAR(20) DEFAULT 'en',
  notifications_email  TINYINT(1) DEFAULT 1,
  notifications_push   TINYINT(1) DEFAULT 1,
  sidebar_collapsed    TINYINT(1) DEFAULT 0,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================================
-- DEFAULT ADMIN (password: Admin@123)
-- bcrypt hash for "Admin@123"
-- ==========================================================
INSERT INTO admins (full_name, email, password) VALUES
('Super Admin', 'admin@stockvault.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uSBK');
