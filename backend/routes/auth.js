const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/config");

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email = ? AND status = 'Active'";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                department: user.department,
                profileImage: user.profile_image
            }
        });
    });
});

// Register
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, phone, address, role, department } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (first_name, last_name, email, password, phone, address, role, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [firstName, lastName, email, hashedPassword, phone, address, role || 'Staff', department], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating user", error: err });
        }
        res.status(201).json({ message: "User created successfully", userId: results.insertId });
    });
});

// Get current user
router.get("/me", (req, res) => {
    const userId = req.headers["user-id"];

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = "SELECT id, first_name, last_name, email, phone, address, role, department, profile_image FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];
        res.json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            department: user.department,
            profileImage: user.profile_image
        });
    });
});

// Setup admin user (run once)
router.post("/setup", async (req, res) => {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const sql = `INSERT INTO users (first_name, last_name, email, password, phone, address, role, department)
                VALUES ('Admin', 'User', 'admin@inventory.com', ?, '+234 801 234 5678', '123 Main Street, Lagos, Nigeria', 'Super Admin', 'Operations')
                ON DUPLICATE KEY UPDATE password = ?`;

    db.query(sql, [hashedPassword, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Setup error", error: err });
        }
        res.json({ message: "Admin user created/updated successfully" });
    });
});

module.exports = router;