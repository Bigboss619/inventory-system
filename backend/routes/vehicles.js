const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all vehicles
router.get("/", (req, res) => {
    const sql = "SELECT * FROM vehicles ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching vehicles", error: err });
        }
        res.json(results);
    });
});

// Get single vehicle by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM vehicles WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching vehicle", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json(results[0]);
    });
});

// Create new vehicle
router.post("/", (req, res) => {
    const { plateNumber, model, year, capacity, driver, status, insuranceExpiry, lastService } = req.body;

    if (!plateNumber || !model || !driver) {
        return res.status(400).json({ message: "Plate number, model, and driver are required" });
    }

    const sql = "INSERT INTO vehicles (plate_number, model, year, capacity, driver, status, insurance_expiry, last_service) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [
        plateNumber,
        model,
        year || new Date().getFullYear(),
        capacity || '5 Seater',
        driver,
        status || 'Active',
        insuranceExpiry || null,
        lastService || new Date().toISOString().split('T')[0]
    ], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating vehicle", error: err });
        }
        res.status(201).json({ message: "Vehicle created successfully", vehicleId: results.insertId });
    });
});

// Update vehicle
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { plateNumber, model, year, capacity, driver, status, insuranceExpiry, lastService } = req.body;

    // Check if vehicle exists
    const checkSql = "SELECT id FROM vehicles WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking vehicle", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (plateNumber) {
            updateFields.push("plate_number = ?");
            updateValues.push(plateNumber);
        }
        if (model) {
            updateFields.push("model = ?");
            updateValues.push(model);
        }
        if (year) {
            updateFields.push("year = ?");
            updateValues.push(year);
        }
        if (capacity) {
            updateFields.push("capacity = ?");
            updateValues.push(capacity);
        }
        if (driver) {
            updateFields.push("driver = ?");
            updateValues.push(driver);
        }
        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }
        if (insuranceExpiry !== undefined) {
            updateFields.push("insurance_expiry = ?");
            updateValues.push(insuranceExpiry);
        }
        if (lastService !== undefined) {
            updateFields.push("last_service = ?");
            updateValues.push(lastService);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(id);
        const sql = `UPDATE vehicles SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating vehicle", error: err });
            }
            res.json({ message: "Vehicle updated successfully" });
        });
    });
});

// Delete vehicle
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM vehicles WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting vehicle", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json({ message: "Vehicle deleted successfully" });
    });
});

module.exports = router;