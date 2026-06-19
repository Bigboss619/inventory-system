const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Helper function to generate auto-incrementing staff_id
const generateStaffId = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT staff_id FROM staff ORDER BY id DESC LIMIT 1";
        db.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve("STF001");
            }
            const lastStaffId = results[0].staff_id;
            const lastNumber = parseInt(lastStaffId.replace('STF', ''));
            const newNumber = lastNumber + 1;
            resolve(`STF${String(newNumber).padStart(3, '0')}`);
        });
    });
};

// Get all staff
router.get("/", (req, res) => {
    const sql = `
        SELECT s.id, s.staff_id, s.first_name, s.last_name, s.email, s.phone, s.position, s.status,
               s.created_at, s.updated_at, d.id as department_id, d.name as department_name
        FROM staff s
        LEFT JOIN departments d ON s.department_id = d.id
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching staff", error: err });
        }
        res.json(results);
    });
});

// Get single staff by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.id, s.staff_id, s.first_name, s.last_name, s.email, s.phone, s.position, s.status,
               s.created_at, s.updated_at, d.id as department_id, d.name as department_name
        FROM staff s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching staff", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.json(results[0]);
    });
});

// Create new staff
router.post("/", async (req, res) => {
    const { firstName, lastName, email, phone, departmentId, position } = req.body;

    if (!firstName || !lastName || !email || !departmentId) {
        return res.status(400).json({ message: "First name, last name, email, and department are required" });
    }

    try {
        const staffId = await generateStaffId();

        const sql = "INSERT INTO staff (staff_id, first_name, last_name, email, phone, department_id, position) VALUES (?, ?, ?, ?, ?, ?, ?)";

        db.query(sql, [staffId, firstName, lastName, email, phone, departmentId, position], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                return res.status(500).json({ message: "Error creating staff", error: err });
            }
            res.status(201).json({ message: "Staff created successfully", staffId: results.insertId, generatedStaffId: staffId });
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating staff ID", error: error });
    }
});

// Update staff
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, departmentId, position, status } = req.body;

    // Check if staff exists
    const checkSql = "SELECT id FROM staff WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking staff", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (firstName) {
            updateFields.push("first_name = ?");
            updateValues.push(firstName);
        }
        if (lastName) {
            updateFields.push("last_name = ?");
            updateValues.push(lastName);
        }
        if (email) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }
        if (phone !== undefined) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        if (departmentId) {
            updateFields.push("department_id = ?");
            updateValues.push(departmentId);
        }
        if (position !== undefined) {
            updateFields.push("position = ?");
            updateValues.push(position);
        }
        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(id);

        const sql = `UPDATE staff SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating staff", error: err });
            }
            res.json({ message: "Staff updated successfully" });
        });
    });
});

// Delete staff
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM staff WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting staff", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.json({ message: "Staff deleted successfully" });
    });
});

module.exports = router;