const express = require("express");
const db = require("../config/config");
const { sendBookingNotificationToAdmin, sendBookingApprovedEmail, sendBookingRejectedEmail, sendProjectorNotificationToIT } = require("../services/emailService");

const router = express.Router();

// Get all bookings (with optional date/status filter)
router.get("/", (req, res) => {
    const { date, startDate, endDate, status } = req.query;

    let sql = `
        SELECT b.id, b.staff_id, b.meeting_title, b.purpose, b.booking_date,
               b.start_time, b.end_time, b.expected_attendees, b.refreshments,
               b.projector, b.notes, b.status, b.created_at, b.updated_at,
               CONCAT(s.first_name, ' ', s.last_name) as requested_by,
               d.name as department_name
        FROM boardroom_bookings b
        LEFT JOIN staff s ON b.staff_id = s.id
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        if (status === 'Pending' || status === 'Confirmed') {
            sql += " AND b.status = ?";
            params.push(status);
        } else if (status === 'Cancelled') {
            sql += " AND b.status = 'Cancelled'";
        }
    } else {
        sql += " AND b.status != 'Cancelled'";
    }

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
        SELECT b.id, b.staff_id, b.meeting_title, b.purpose, b.booking_date,
               b.start_time, b.end_time, b.expected_attendees, b.refreshments,
               b.projector, b.notes, b.status, b.created_at, b.updated_at,
               CONCAT(s.first_name, ' ', s.last_name) as requested_by,
               d.name as department_name
        FROM boardroom_bookings b
        LEFT JOIN staff s ON b.staff_id = s.id
        LEFT JOIN departments d ON s.department_id = d.id
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

// Create new booking (no auth required)
router.post("/", (req, res) => {
    const {
        staffId, meetingTitle, purpose, bookingDate, startTime, endTime,
        expectedAttendees, refreshments, projector, notes
    } = req.body;

    if (!staffId || !meetingTitle || !bookingDate || !startTime || !endTime) {
        return res.status(400).json({ message: "Required fields are missing" });
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
            INSERT INTO boardroom_bookings
            (staff_id, meeting_title, purpose, booking_date, start_time, end_time,
             expected_attendees, refreshments, projector, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            staffId, meetingTitle, purpose, bookingDate, startTime, endTime,
            expectedAttendees || 1, refreshments || 'No', projector || 'No', notes
        ], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error creating booking", error: err });
            }

            const bookingId = results.insertId;

            // Get booking details with staff info for email
            const getBookingSql = `
                SELECT b.*, CONCAT(s.first_name, ' ', s.last_name) as requested_by, d.name as department_name
                FROM boardroom_bookings b
                LEFT JOIN staff s ON b.staff_id = s.id
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE b.id = ?
            `;

            db.query(getBookingSql, [bookingId], (err, bookingResults) => {
                if (!err && bookingResults.length > 0) {
                    const booking = bookingResults[0];
                    // Send email to admin
                    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
                    sendBookingNotificationToAdmin(booking, adminEmail).catch(console.error);
                }
            });

            res.status(201).json({ message: "Booking created successfully", bookingId: results.insertId });
        });
    });
});

// Update booking
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const {
        meetingTitle, purpose, bookingDate, startTime, endTime,
        expectedAttendees, refreshments, projector, notes, status
    } = req.body;

    // Check if booking exists
    const checkSql = "SELECT * FROM boardroom_bookings WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking booking", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (meetingTitle) {
            updateFields.push("meeting_title = ?");
            updateValues.push(meetingTitle);
        }
        if (purpose !== undefined) {
            updateFields.push("purpose = ?");
            updateValues.push(purpose);
        }
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
        if (expectedAttendees) {
            updateFields.push("expected_attendees = ?");
            updateValues.push(expectedAttendees);
        }
        if (refreshments) {
            updateFields.push("refreshments = ?");
            updateValues.push(refreshments);
        }
        if (projector) {
            updateFields.push("projector = ?");
            updateValues.push(projector);
        }
        if (notes !== undefined) {
            updateFields.push("notes = ?");
            updateValues.push(notes);
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

            // Send email notification if status changed
            if (status === 'Confirmed' || status === 'Cancelled') {
                const getBookingSql = `
                    SELECT b.*, s.email as staff_email,
                           CONCAT(s.first_name, ' ', s.last_name) as requested_by,
                           d.name as department_name
                    FROM boardroom_bookings b
                    LEFT JOIN staff s ON b.staff_id = s.id
                    LEFT JOIN departments d ON s.department_id = d.id
                    WHERE b.id = ?
                `;
                db.query(getBookingSql, [id], (err, bookingResults) => {
                    if (!err && bookingResults.length > 0) {
                        const booking = bookingResults[0];
                        if (status === 'Confirmed') {
                            // Send approval email to staff
                            if (booking.staff_email) {
                                sendBookingApprovedEmail(booking, booking.staff_email).catch(console.error);
                            }
                            // Send IT notification if projector is requested
                            if (booking.projector === 'Yes') {
                                const itEmail = process.env.IT_EMAIL;
                                if (itEmail) {
                                    sendProjectorNotificationToIT(booking, itEmail).catch(console.error);
                                }
                            }
                        } else if (status === 'Cancelled') {
                            if (booking.staff_email) {
                                sendBookingRejectedEmail(booking, booking.staff_email).catch(console.error);
                            }
                        }
                    }
                });
            }

            res.json({ message: "Booking updated successfully" });
        });
    });
});

// Cancel booking
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE boardroom_bookings SET status = 'Cancelled' WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error cancelling booking", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking cancelled successfully" });
    });
});

// Get available time slots for a specific date
router.get("/available-slots/:date", (req, res) => {
    const { date } = req.params;

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

        const bookedSlots = results.map(r => ({
            start: r.start_time,
            end: r.end_time
        }));

        const availableSlots = [];

        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

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