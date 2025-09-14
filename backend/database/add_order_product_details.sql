-- Add product details columns to order_items table
-- This ensures we store complete product information for emails

USE atlantic_leather_db;

-- Add new columns to store complete product information
ALTER TABLE order_items 
ADD COLUMN product_name VARCHAR(255) NOT NULL AFTER product_id,
ADD COLUMN product_image VARCHAR(255) AFTER product_name,
ADD COLUMN product_category VARCHAR(100) AFTER product_image,
ADD COLUMN original_price DECIMAL(10,2) AFTER price;

-- Update existing records with product information
UPDATE order_items oi
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
SET 
  oi.product_name = p.title,
  oi.product_image = COALESCE(pi.image_url, '/placeholder-product.jpg'),
  oi.product_category = c.name,
  oi.original_price = p.original_price;

-- Make the new columns NOT NULL after populating them
ALTER TABLE order_items 
MODIFY COLUMN product_name VARCHAR(255) NOT NULL,
MODIFY COLUMN product_category VARCHAR(100) NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_order_items_product_name ON order_items(product_name);
CREATE INDEX idx_order_items_product_category ON order_items(product_category);
