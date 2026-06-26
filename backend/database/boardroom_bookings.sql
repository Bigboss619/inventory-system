-- Boardroom Bookings Table
CREATE TABLE IF NOT EXISTS boardroom_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    meeting_title VARCHAR(255) NOT NULL,
    purpose TEXT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    expected_attendees INT DEFAULT 1,
    refreshments ENUM('No', 'Yes') DEFAULT 'No',
    projector ENUM('No', 'Yes') DEFAULT 'No',
    notes TEXT,
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Index for efficient date range queries
CREATE INDEX idx_booking_date ON boardroom_bookings(booking_date);
CREATE INDEX idx_staff_id ON boardroom_bookings(staff_id);