const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Login
router.post("/login", (req, res) => {
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

        // For demo purposes, plain text comparison
        // In production, use: const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = password === user.password;

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

// Register (for creating first admin)
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, phone, address, role, department } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);
    // For demo, using plain text: In production, use hashedPassword
    const hashedPassword = password;

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

module.exports = router;