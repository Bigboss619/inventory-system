-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(200) NOT NULL,
    year INT,
    capacity VARCHAR(50),
    driver VARCHAR(200) NOT NULL,
    status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active',
    insurance_expiry DATE,
    last_service DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample vehicles
INSERT INTO vehicles (plate_number, model, year, capacity, driver, status, insurance_expiry, last_service) VALUES
('ABC-1234', 'Toyota Camry', 2022, '5 Seater', 'John Smith', 'Active', '2026-12-31', '2026-05-10'),
('XYZ-5678', 'Honda Civic', 2021, '5 Seater', 'Sarah Johnson', 'Active', '2026-08-15', '2026-04-20'),
('DEF-9012', 'Ford Transit', 2020, '12 Seater', 'Michael Brown', 'Maintenance', '2026-06-30', '2026-06-01'),
('GHI-3456', 'Toyota Hiace', 2023, '14 Seater', 'Emily Davis', 'Active', '2027-01-31', '2026-05-25'),
('JKL-7890', 'Mitsubishi L200', 2022, 'Pickup', 'David Wilson', 'Active', '2026-09-20', '2026-03-15'),
('MNO-1122', 'Nissan Sentra', 2021, '5 Seater', 'Lisa Anderson', 'Inactive', '2025-11-30', '2025-10-10')
ON DUPLICATE KEY UPDATE model = VALUES(model);