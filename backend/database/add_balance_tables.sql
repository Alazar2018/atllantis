-- Add balance and transaction tracking tables
USE atlantic_leather_db;

-- Admin balance table
CREATE TABLE IF NOT EXISTS admin_balance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  current_balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Transactions table for tracking all financial activities
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_id INT,
  type ENUM('sale', 'withdrawal', 'refund', 'adjustment') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_order (order_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert default balance record for existing admin users
INSERT IGNORE INTO admin_balance (user_id, current_balance, total_earned, total_withdrawn)
SELECT id, 0.00, 0.00, 0.00 FROM users WHERE role = 'admin' LIMIT 1;
