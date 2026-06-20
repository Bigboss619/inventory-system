const express = require("express");
const db = require("../config/config");

const router = express.Router();

// ==================== VEHICLES ====================

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

// Get single vehicle by asset_id
router.get("/:assetId", (req, res) => {
    const { assetId } = req.params;
    const sql = "SELECT * FROM vehicles WHERE asset_id = ?";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching vehicle", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json(results[0]);
    });
});

// Create new vehicle (asset_id is auto-generated)
router.post("/", (req, res) => {
    const { name, chassisNumber, plateNumber, model, staffName, staffEmail, documents, maintenance } = req.body;

    if (!chassisNumber || !model) {
        return res.status(400).json({ message: "Chassis number and model are required" });
    }

    const sql = "INSERT INTO vehicles (name, chassis_number, plate_number, model, staff_name, staff_email) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [
        name || null,
        chassisNumber,
        plateNumber || null,
        model,
        staffName || null,
        staffEmail || null
    ], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating vehicle", error: err });
        }
        const newAssetId = `AST-${String(results.insertId).padStart(3, '0')}`;
        const updateSql = "UPDATE vehicles SET asset_id = ? WHERE id = ?";
        db.query(updateSql, [newAssetId, results.insertId], (updateErr) => {
            if (updateErr) {
                console.error("Error generating asset_id:", updateErr);
            }
        });

        // Insert documents if any
        if (documents && documents.length > 0) {
            documents.forEach(doc => {
                const docSql = "INSERT INTO vehicle_documents (asset_id, name, issue_date, expiry_date, status, reminder_days) VALUES (?, ?, ?, ?, ?, ?)";
                db.query(docSql, [
                    newAssetId,
                    doc.name,
                    doc.issueDate || null,
                    doc.expiryDate || null,
                    doc.status || 'active',
                    doc.reminderDays || 30
                ]);
            });
        }

        // Insert maintenance if any
        if (maintenance && maintenance.length > 0) {
            maintenance.forEach(maint => {
                const maintSql = "INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
                db.query(maintSql, [
                    newAssetId,
                    maint.maintenanceType,
                    maint.lastService || null,
                    maint.nextDue || null,
                    maint.cost || null,
                    maint.reminderDays || 30,
                    maint.notes || null
                ]);
            });
        }

        res.status(201).json({ message: "Vehicle created successfully", assetId: newAssetId });
    });
});

// Update vehicle
router.put("/:assetId", (req, res) => {
    const { assetId } = req.params;
    const { name, chassisNumber, plateNumber, model, staffName, staffEmail } = req.body;

    // Check if vehicle exists
    const checkSql = "SELECT id FROM vehicles WHERE asset_id = ?";
    db.query(checkSql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking vehicle", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (name !== undefined) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }
        if (chassisNumber) {
            updateFields.push("chassis_number = ?");
            updateValues.push(chassisNumber);
        }
        if (plateNumber) {
            updateFields.push("plate_number = ?");
            updateValues.push(plateNumber);
        }
        if (model) {
            updateFields.push("model = ?");
            updateValues.push(model);
        }
        if (staffName) {
            updateFields.push("staff_name = ?");
            updateValues.push(staffName);
        }
        if (staffEmail) {
            updateFields.push("staff_email = ?");
            updateValues.push(staffEmail);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(assetId);
        const sql = `UPDATE vehicles SET ${updateFields.join(", ")} WHERE asset_id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating vehicle", error: err });
            }
            res.json({ message: "Vehicle updated successfully" });
        });
    });
});

// Delete vehicle
router.delete("/:assetId", (req, res) => {
    const { assetId } = req.params;

    const sql = "DELETE FROM vehicles WHERE asset_id = ?";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting vehicle", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json({ message: "Vehicle deleted successfully" });
    });
});

// ==================== DOCUMENTS ====================

// Get all documents for a vehicle
router.get("/:assetId/documents", (req, res) => {
    const { assetId } = req.params;
    const sql = "SELECT * FROM vehicle_documents WHERE asset_id = ? ORDER BY id DESC";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching documents", error: err });
        }
        res.json(results);
    });
});

// Get single document
router.get("/documents/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM vehicle_documents WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching document", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(results[0]);
    });
});

// Create document
router.post("/documents", (req, res) => {
    const { assetId, name, issueDate, expiryDate, status, reminderDays, uploadedBy, filePath } = req.body;

    if (!assetId || !name) {
        return res.status(400).json({ message: "Asset ID and name are required" });
    }

    const sql = "INSERT INTO vehicle_documents (asset_id, name, issue_date, expiry_date, status, reminder_days, uploaded_by, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [
        assetId,
        name,
        issueDate || null,
        expiryDate || null,
        status || 'active',
        reminderDays || 30,
        uploadedBy || null,
        filePath || null
    ], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating document", error: err });
        }
        res.status(201).json({ message: "Document created successfully", documentId: results.insertId });
    });
});

// Update document
router.put("/documents/:id", (req, res) => {
    const { id } = req.params;
    const { name, issueDate, expiryDate, status, reminderDays, uploadedBy, filePath } = req.body;

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (name) {
        updateFields.push("name = ?");
        updateValues.push(name);
    }
    if (issueDate !== undefined) {
        updateFields.push("issue_date = ?");
        updateValues.push(issueDate);
    }
    if (expiryDate !== undefined) {
        updateFields.push("expiry_date = ?");
        updateValues.push(expiryDate);
    }
    if (status) {
        updateFields.push("status = ?");
        updateValues.push(status);
    }
    if (reminderDays !== undefined) {
        updateFields.push("reminder_days = ?");
        updateValues.push(reminderDays);
    }
    if (uploadedBy) {
        updateFields.push("uploaded_by = ?");
        updateValues.push(uploadedBy);
    }
    if (filePath !== undefined) {
        updateFields.push("file_path = ?");
        updateValues.push(filePath);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    updateValues.push(id);
    const sql = `UPDATE vehicle_documents SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(sql, updateValues, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error updating document", error: err });
        }
        res.json({ message: "Document updated successfully" });
    });
});

// Delete document
router.delete("/documents/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM vehicle_documents WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting document", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json({ message: "Document deleted successfully" });
    });
});

// ==================== MAINTENANCE ====================

// Get all maintenance records for a vehicle
router.get("/:assetId/maintenance", (req, res) => {
    const { assetId } = req.params;
    const sql = "SELECT * FROM maintenance WHERE asset_id = ? ORDER BY id DESC";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching maintenance records", error: err });
        }
        res.json(results);
    });
});

// Get single maintenance record
router.get("/maintenance/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM maintenance WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching maintenance record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Maintenance record not found" });
        }
        res.json(results[0]);
    });
});

// Create maintenance record
router.post("/maintenance", (req, res) => {
    const { assetId, maintenanceType, lastService, nextDue, cost, reminderDays, notes } = req.body;

    if (!assetId || !maintenanceType) {
        return res.status(400).json({ message: "Asset ID and maintenance type are required" });
    }

    const sql = "INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [
        assetId,
        maintenanceType,
        lastService || null,
        nextDue || null,
        cost || null,
        reminderDays || 30,
        notes || null
    ], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating maintenance record", error: err });
        }
        res.status(201).json({ message: "Maintenance record created successfully", maintenanceId: results.insertId });
    });
});

// Update maintenance record
router.put("/maintenance/:id", (req, res) => {
    const { id } = req.params;
    const { maintenanceType, lastService, nextDue, cost, reminderDays, notes } = req.body;

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (maintenanceType) {
        updateFields.push("maintenance_type = ?");
        updateValues.push(maintenanceType);
    }
    if (lastService !== undefined) {
        updateFields.push("last_service = ?");
        updateValues.push(lastService);
    }
    if (nextDue !== undefined) {
        updateFields.push("next_due = ?");
        updateValues.push(nextDue);
    }
    if (cost !== undefined) {
        updateFields.push("cost = ?");
        updateValues.push(cost);
    }
    if (reminderDays !== undefined) {
        updateFields.push("reminder_days = ?");
        updateValues.push(reminderDays);
    }
    if (notes !== undefined) {
        updateFields.push("notes = ?");
        updateValues.push(notes);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    updateValues.push(id);
    const sql = `UPDATE maintenance SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(sql, updateValues, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error updating maintenance record", error: err });
        }
        res.json({ message: "Maintenance record updated successfully" });
    });
});

// Delete maintenance record
router.delete("/maintenance/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM maintenance WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting maintenance record", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Maintenance record not found" });
        }
        res.json({ message: "Maintenance record deleted successfully" });
    });
});

module.exports = router;