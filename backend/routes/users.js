const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/config");

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
    const sql = "SELECT id, first_name, last_name, email, phone, address, role, department, status, profile_image, created_at, updated_at FROM users ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching users", error: err });
        }
        res.json(results);
    });
});

// Get single user by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id, first_name, last_name, email, phone, address, role, department, status, profile_image, created_at, updated_at FROM users WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching user", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(results[0]);
    });
});

// Create new user
router.post("/", async (req, res) => {
    const { firstName, lastName, email, password, phone, address, role, department } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "First name, last name, email, and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (first_name, last_name, email, password, phone, address, role, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        db.query(sql, [firstName, lastName, email, hashedPassword, phone, address, role || 'Staff', department], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                return res.status(500).json({ message: "Error creating user", error: err });
            }
            res.status(201).json({ message: "User created successfully", userId: results.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: "Error hashing password", error: error });
    }
});

// Update user
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, password, phone, address, role, department, status } = req.body;

    // Check if user exists
    const checkSql = "SELECT id FROM users WHERE id = ?";
    db.query(checkSql, [id], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking user", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
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
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push("password = ?");
            updateValues.push(hashedPassword);
        }
        if (phone !== undefined) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        if (address !== undefined) {
            updateFields.push("address = ?");
            updateValues.push(address);
        }
        if (role) {
            updateFields.push("role = ?");
            updateValues.push(role);
        }
        if (department !== undefined) {
            updateFields.push("department = ?");
            updateValues.push(department);
        }
        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(id);

        const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating user", error: err });
            }
            res.json({ message: "User updated successfully" });
        });
    });
});

// Delete user
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Don't allow deleting yourself
    const userId = req.headers["user-id"];
    if (parseInt(id) === parseInt(userId)) {
        return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting user", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

// Update user status (activate/deactivate)
router.patch("/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'Active' or 'Inactive'" });
    }

    const sql = "UPDATE users SET status = ? WHERE id = ?";

    db.query(sql, [status, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error updating status", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: `User ${status.toLowerCase()}d successfully` });
    });
});

module.exports = router;