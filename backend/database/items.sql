-- Items Table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    unit ENUM('pcs', 'box', 'ream', 'set', 'kg', 'liter', 'pack', 'bundle') DEFAULT 'pcs',
    quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert sample items
INSERT INTO items (item_code, name, description, category_id, unit, quantity, min_stock_level) VALUES
('LAP-001', 'Dell XPS 15 Laptop', 'High-performance laptop for professionals', 1, 'pcs', 5, 3),
('MON-001', 'LG UltraWide Monitor', '34-inch ultrawide curved monitor', 1, 'pcs', 3, 2),
('KIT-001', 'Office Desk Chair', 'Ergonomic office chair with lumbar support', 2, 'pcs', 15, 5),
('KIT-002', 'Standing Desk', 'Adjustable standing desk', 2, 'pcs', 8, 3),
('STA-001', 'A4 Paper (Ream)', 'High-quality white A4 paper', 3, 'ream', 50, 20),
('STA-002', 'Ballpoint Pens (Box)', 'Blue ballpoint pens box of 50', 3, 'box', 10, 5),
('KIT-003', 'HP Printer', 'Laser jet printer', 4, 'pcs', 12, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);