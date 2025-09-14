-- Create admin user
USE atlantic_leather_db;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role, active) VALUES 
('admin', 'admin@atlanticleather.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE)
ON DUPLICATE KEY UPDATE 
  password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  role = 'admin',
  active = TRUE;

-- Verify the user was created
SELECT id, username, email, role, active FROM users WHERE username = 'admin';
