
-- Drop tables if they exist
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS feature_flags;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(255),
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_master_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create feature_flags table
CREATE TABLE feature_flags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled) VALUES
('FEATURE_CHATBOT', 'Enable chat bot functionality', true),
('FEATURE_ANALYTICS', 'Enable analytics functionality', true);

-- Insert default admin user
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@example.com', '$2b$10$RFYgT3JqXk2VxBzULf9FeeCZjXK/jQNj7Kyg.EahjLVr95lXU1o4e', 'Admin', 'User', 'admin');
-- Password is 'admin123' (hashed with bcrypt)

-- Insert profile for admin
INSERT INTO profiles (user_id, email, first_name, last_name, is_super_admin) VALUES
(1, 'admin@example.com', 'Admin', 'User', true);
