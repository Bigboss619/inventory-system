-- Vehicles table with auto-generated asset_id
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200),
  chassis_number VARCHAR(100) NOT NULL,
  plate_number VARCHAR(20) UNIQUE,
  model VARCHAR(200) NOT NULL,
  staff_name VARCHAR(200),
  staff_email VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trigger to auto-generate asset_id
DELIMITER //
CREATE TRIGGER before_insert_vehicle
BEFORE INSERT ON vehicles
FOR EACH ROW
BEGIN
  SET NEW.asset_id = CONCAT('AST-', LPAD(NEW.id, 3, '0'));
END//
DELIMITER ;

-- Documents table
CREATE TABLE vehicle_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status ENUM('active', 'expired', 'renewed') DEFAULT 'active',
  reminder_days INT DEFAULT 30,
  uploaded_by VARCHAR(200),
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES vehicles(asset_id) ON DELETE CASCADE
);

-- Maintenance table
CREATE TABLE maintenance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL,
  maintenance_type VARCHAR(200) NOT NULL,
  last_service DATE,
  next_due DATE,
  cost DECIMAL(10, 2),
  reminder_days INT DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES vehicles(asset_id) ON DELETE CASCADE
);

-- Sample data for vehicles (asset_id will be auto-generated)
INSERT INTO vehicles (name, chassis_number, plate_number, model, staff_name, staff_email) VALUES
('Company Car 1', 'JM1BK343551234567', 'ABC-1234', 'Toyota Camry', 'John Smith', 'john.smith@company.com'),
('Company Car 2', 'JM1BK343561234568', 'XYZ-5678', 'Honda Civic', 'Sarah Johnson', 'sarah.j@company.com'),
('Company Car 3', 'JM1BK343571234569', 'DEF-9012', 'Ford Transit', 'Michael Brown', 'michael.b@company.com');

-- Sample data for documents
INSERT INTO vehicle_documents (asset_id, name, issue_date, expiry_date, status, reminder_days, uploaded_by) VALUES
('AST-001', 'Insurance', '2026-01-01', '2026-12-31', 'active', 30, 'Admin'),
('AST-001', 'Road Tax', '2026-01-01', '2026-12-31', 'active', 30, 'Admin'),
('AST-002', 'Insurance', '2026-01-01', '2026-12-31', 'active', 30, 'Admin'),
('AST-003', 'Insurance', '2026-01-01', '2026-06-30', 'active', 30, 'Admin');

-- Sample data for maintenance
INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes) VALUES
('AST-001', 'Oil Change', '2026-05-01', '2026-08-01', 150.00, 30, 'Regular service'),
('AST-002', 'Tire Rotation', '2026-04-01', '2026-07-01', 80.00, 30, 'Routine maintenance'),
('AST-003', 'Brake Service', '2026-05-15', '2026-06-15', 200.00, 7, 'Urgent fix needed');