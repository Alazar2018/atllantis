-- Add "Sold" status to orders table ENUM
USE atlantic_leather_db;

-- First, create a temporary table with the new ENUM
CREATE TABLE orders_temp LIKE orders;

-- Modify the status column to include "Sold"
ALTER TABLE orders_temp MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Sold', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending';

-- Copy data from original table
INSERT INTO orders_temp SELECT * FROM orders;

-- Drop original table and rename temp table
DROP TABLE orders;
RENAME TABLE orders_temp TO orders;

-- Recreate indexes
ALTER TABLE orders ADD INDEX idx_customer_email (customer_email);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE orders ADD INDEX idx_payment_status (payment_status);
ALTER TABLE orders ADD INDEX idx_created_at (created_at);
