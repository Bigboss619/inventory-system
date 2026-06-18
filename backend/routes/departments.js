const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all departments
router.get("/", (req, res) => {
    const sql = "SELECT * FROM departments ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching departments", error: err });
        }
        res.json(results);
    });
});

// Get single department by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM departments WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching department", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(results[0]);
    });
});

// Create new department
router.post("/", (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Department name is required" });
    }

    const sql = "INSERT INTO departments (name, description) VALUES (?, ?)";

    db.query(sql, [name, description], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Department already exists" });
            }
            return res.status(500).json({ message: "Error creating department", error: err });
        }
        res.status(201).json({ message: "Department created successfully", departmentId: results.insertId });
    });
});

// Update department
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Department name is required" });
    }

    const sql = "UPDATE departments SET name = ?, description = ? WHERE id = ?";

    db.query(sql, [name, description, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error updating department", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json({ message: "Department updated successfully" });
    });
});

// Delete department
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM departments WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting department", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
    });
});

module.exports = router;