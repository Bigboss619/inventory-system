const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all bookings (with optional date filter)
router.get("/", (req, res) => {
    const { date, startDate, endDate } = req.query;

    let sql = `
        SELECT b.id, b.user_id, b.booking_date, b.start_time, b.end_time, b.purpose,
               b.attendees, b.status, b.created_at, b.updated_at,
               CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email as user_email
        FROM boardroom_bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.status != 'Cancelled'
    `;
    const params = [];

    if (date) {
        sql += " AND b.booking_date = ?";
        params.push(date);
    } else if (startDate && endDate) {
        sql += " AND b.booking_date BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }

    sql += " ORDER BY b.booking_date ASC, b.start_time ASC";

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching bookings", error: err });
        }
        res.json(results);
    });
});

// Get single booking by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT b.id, b.user_id, b.booking_date, b.start_time, b.end_time, b.purpose,
               b.attendees, b.status, b.created_at, b.updated_at,
               CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email as user_email
        FROM boardroom_bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching booking", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json(results[0]);
    });
});

// Create new booking
router.post("/", (req, res) => {
    const { userId } = req.headers;
    const { bookingDate, startTime, endTime, purpose, attendees } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!bookingDate || !startTime || !endTime || !purpose) {
        return res.status(400).json({ message: "Booking date, start time, end time, and purpose are required" });
    }

    // Check for time conflicts
    const checkSql = `
        SELECT id FROM boardroom_bookings
        WHERE booking_date = ? AND status != 'Cancelled'
        AND (
            (start_time < ? AND end_time > ?) OR
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND end_time <= ?)
        )
    `;

    db.query(checkSql, [bookingDate, endTime, startTime, endTime, startTime, startTime, endTime], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking conflicts", error: err });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Time slot is already booked" });
        }

        const sql = `
            INSERT INTO boardroom_bookings (user_id, booking_date, start_time, end_time, purpose, attendees)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [userId, bookingDate, startTime, endTime, purpose, attendees || 1], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error creating booking", error: err });
            }
            res.status(201).json({ message: "Booking created successfully", bookingId: results.insertId });
        });
    });
});

// Update booking
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { userId } = req.headers;
    const { bookingDate, startTime, endTime, purpose, attendees, status } = req.body;

    // Check if booking exists
    const checkSql = "SELECT * FROM boardroom_bookings WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking booking", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = results[0];

        // Only the booking owner or Super Admin can update
        if (booking.user_id !== parseInt(userId)) {
            const roleCheck = "SELECT role FROM users WHERE id = ?";
            db.query(roleCheck, [userId], (err, userResults) => {
                if (err || userResults.length === 0 || userResults[0].role !== 'Super Admin') {
                    return res.status(403).json({ message: "You can only update your own bookings" });
                }
            });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (bookingDate) {
            updateFields.push("booking_date = ?");
            updateValues.push(bookingDate);
        }
        if (startTime) {
            updateFields.push("start_time = ?");
            updateValues.push(startTime);
        }
        if (endTime) {
            updateFields.push("end_time = ?");
            updateValues.push(endTime);
        }
        if (purpose) {
            updateFields.push("purpose = ?");
            updateValues.push(purpose);
        }
        if (attendees !== undefined) {
            updateFields.push("attendees = ?");
            updateValues.push(attendees);
        }
        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(id);

        const sql = `UPDATE boardroom_bookings SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating booking", error: err });
            }
            res.json({ message: "Booking updated successfully" });
        });
    });
});

// Cancel booking
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const { userId } = req.headers;

    // Check if booking exists
    const checkSql = "SELECT * FROM boardroom_bookings WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking booking", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = results[0];

        // Only the booking owner or Super Admin can cancel
        if (booking.user_id !== parseInt(userId)) {
            const roleCheck = "SELECT role FROM users WHERE id = ?";
            db.query(roleCheck, [userId], (err, userResults) => {
                if (err || userResults.length === 0 || userResults[0].role !== 'Super Admin') {
                    return res.status(403).json({ message: "You can only cancel your own bookings" });
                }
                // Proceed with cancellation by Super Admin
                performCancellation(id, res);
            });
        } else {
            performCancellation(id, res);
        }
    });
});

function performCancellation(id, res) {
    const sql = "UPDATE boardroom_bookings SET status = 'Cancelled' WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error cancelling booking", error: err });
        }
        res.json({ message: "Booking cancelled successfully" });
    });
}

// Get available time slots for a specific date
router.get("/available-slots/:date", (req, res) => {
    const { date } = req.params;

    // Define working hours: 8 AM to 6 PM
    const workingHoursStart = "08:00:00";
    const workingHoursEnd = "18:00:00";

    const sql = `
        SELECT start_time, end_time
        FROM boardroom_bookings
        WHERE booking_date = ? AND status != 'Cancelled'
        ORDER BY start_time ASC
    `;

    db.query(sql, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching time slots", error: err });
        }

        // Generate available slots
        const bookedSlots = results.map(r => ({
            start: r.start_time,
            end: r.end_time
        }));

        // Create time array from 8:00 to 18:00 in 30-minute intervals
        const availableSlots = [];

        // Helper to parse time string to minutes
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Helper to convert minutes to time string
        const minutesToTime = (mins) => {
            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        };

        let currentTime = timeToMinutes(workingHoursStart);
        const endTime = timeToMinutes(workingHoursEnd);

        while (currentTime < endTime) {
            const slotStart = minutesToTime(currentTime);
            const slotEnd = minutesToTime(currentTime + 30);

            // Check if this slot conflicts with any booking
            const isBooked = bookedSlots.some(slot => {
                const slotStartMins = timeToMinutes(slot.start);
                const slotEndMins = timeToMinutes(slot.end);

                return (currentTime >= slotStartMins && currentTime < slotEndMins) ||
                       (currentTime < slotStartMins && currentTime + 30 > slotStartMins);
            });

            if (!isBooked) {
                availableSlots.push({
                    start: slotStart,
                    end: slotEnd
                });
            }

            currentTime += 30;
        }

        res.json(availableSlots);
    });
});

module.exports = router;