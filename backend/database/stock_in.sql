-- Stock In Transactions Table
CREATE TABLE IF NOT EXISTS stock_in (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    supplier VARCHAR(200),
    note TEXT,
    received_by INT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (received_by) REFERENCES users(id)
);

-- Stock Out Transactions Table
CREATE TABLE IF NOT EXISTS stock_out (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    department_id INT NOT NULL,
    requested_by INT,
    issued_by INT,
    note TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (issued_by) REFERENCES users(id)
);