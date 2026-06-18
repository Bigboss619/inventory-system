-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('Super Admin', 'Inventory Officer', 'Document Officer', 'Staff') DEFAULT 'Staff',
    department_id INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Insert default admin user (password: admin123)
-- Hash for admin123: $2b$10$X7VQPB1mN.5./T5T5Q5T5.O
INSERT INTO users (first_name, last_name, email, password, phone, address, role, department) VALUES
('Admin', 'User', 'admin@inventory.com', '$2b$10$X7VQPB1mN.5./T5T5Q5T5O', '+234 801 234 5678', '123 Main Street, Lagos, Nigeria', 'Super Admin', 'Operations');