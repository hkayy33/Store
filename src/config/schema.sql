-- Create database
CREATE DATABASE IF NOT EXISTS grocerystore;
USE grocerystore;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Customers table for secure registration
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, category, subcategory, price, image_url, description, stock_quantity) VALUES
('Potato', 'Vegetables', 'Root Vegetables', 1.99, 'images/potato.jpg', 'Fresh organic potatoes', 100),
('Carrots', 'Vegetables', 'Root Vegetables', 2.49, 'images/carrots.jpg', 'Fresh organic carrots', 80),
('Broccoli', 'Vegetables', 'Cruciferous', 3.99, 'images/broccoli.jpg', 'Fresh organic broccoli', 60),
('Chicken', 'Meat', 'Poultry', 5.99, 'images/chicken.jpg', 'Fresh chicken breast', 50),
('Fish', 'Meat', 'Seafood', 8.99, 'images/fish.jpg', 'Fresh salmon fillet', 30),
('Beef', 'Meat', 'Red Meat', 7.99, 'images/beef.jpg', 'Premium beef steak', 40),
('Pork', 'Meat', 'Red Meat', 6.99, 'images/pork.jpg', 'Fresh pork chops', 45);

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@grocerystore.com', 'admin'); 