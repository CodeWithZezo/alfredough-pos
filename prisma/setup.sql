-- ============================================
-- Alfredough POS System - Database Setup SQL
-- Run this in phpMyAdmin or MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS alfredough_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alfredough_pos;

-- Admins
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('active','inactive') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  categoryId INT NOT NULL,
  basePrice DECIMAL(10,2) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Product Variants
CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
);

-- Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT,
  adminId INT NOT NULL,
  orderType ENUM('dine_in','takeaway','delivery') DEFAULT 'dine_in',
  status ENUM('pending','completed','cancelled','returned') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  serviceCharge DECIMAL(10,2) DEFAULT 0,
  discountType ENUM('percentage','amount'),
  discountValue DECIMAL(10,2) DEFAULT 0,
  discountAmount DECIMAL(10,2) DEFAULT 0,
  deliveryFee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (adminId) REFERENCES admins(id)
);

-- Order Items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  variantId INT NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (variantId) REFERENCES product_variants(id)
);

-- Kitchen Stock
CREATE TABLE kitchen_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  minStock DECIMAL(10,3) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kitchen Stock History
CREATE TABLE kitchen_stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stockId INT NOT NULL,
  action ENUM('add','use','update','delete') NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  note TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stockId) REFERENCES kitchen_stock(id)
);

-- Order Edits (Audit)
CREATE TABLE order_edits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  adminId INT NOT NULL,
  changeNote TEXT NOT NULL,
  oldTotal DECIMAL(10,2) NOT NULL,
  newTotal DECIMAL(10,2) NOT NULL,
  editedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (adminId) REFERENCES admins(id)
);

-- Order Cancellations (Audit)
CREATE TABLE order_cancellations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL UNIQUE,
  adminId INT NOT NULL,
  reason TEXT NOT NULL,
  cancelledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (adminId) REFERENCES admins(id)
);

-- Order Returns (Audit)
CREATE TABLE order_returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  adminId INT NOT NULL,
  reason TEXT NOT NULL,
  refundAmount DECIMAL(10,2) NOT NULL,
  returnedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (adminId) REFERENCES admins(id)
);

-- Order ID Mapping
CREATE TABLE order_id_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL UNIQUE,
  externalId VARCHAR(255) NOT NULL,
  system VARCHAR(100) NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- ============================================
-- Seed: Default Admin (password: admin123)
-- ============================================
INSERT INTO admins (username, password, name) VALUES
('admin', '$2b$10$rJ9JNuFyBBWvIkmVbDwXUuCEWwYlJBXz3k8TJ8mVa.DuCaI./hj2K', 'Super Admin');

-- Seed: Sample Categories
INSERT INTO categories (name) VALUES ('Burgers'), ('Pizzas'), ('Drinks'), ('Desserts');

-- Seed: Sample Stock
INSERT INTO kitchen_stock (name, quantity, unit, minStock) VALUES
('Flour', 50, 'kg', 10),
('Tomato Sauce', 20, 'liters', 5),
('Cheese', 15, 'kg', 3),
('Chicken', 30, 'kg', 5);

