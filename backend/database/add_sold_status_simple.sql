-- Add "Sold" status to orders table ENUM (simple approach)
USE atlantic_leather_db;

-- Modify the status column to include "Sold"
ALTER TABLE orders MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Sold', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending';
