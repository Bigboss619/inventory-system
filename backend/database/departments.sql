-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
('Operations', 'Core business operations and inventory management'),
('Administration', 'General administrative tasks and support'),
('Finance', 'Financial management and accounting'),
('IT', 'Information technology and systems'),
('HR', 'Human resources management'),
('Sales', 'Sales and customer relations'),
('Logistics', 'Logistics and supply chain management');