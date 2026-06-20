-- Document Renewals Table
CREATE TABLE IF NOT EXISTS document_renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    old_expiry_date DATE,
    new_expiry_date DATE NOT NULL,
    renewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renewed_by VARCHAR(200),
    FOREIGN KEY (document_id) REFERENCES vehicle_documents(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_document_renewals_document_id ON document_renewals(document_id);