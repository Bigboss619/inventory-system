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

// Get all maintenance records across all vehicles
router.get("/all/maintenance", (req, res) => {
    const sql = `
        SELECT m.id, m.asset_id, m.maintenance_type, m.last_service, m.next_due, m.cost,
               m.reminder_days, m.notes, m.created_at, m.updated_at,
               v.name as vehicle_name
        FROM maintenance m
        LEFT JOIN vehicles v ON m.asset_id = v.asset_id
        ORDER BY m.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching all maintenance records", error: err });
        }
        // Convert date objects to YYYY-MM-DD strings
        const formatDate = (d) => d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : d;
        const formatted = (results || []).map(r => ({
            ...r,
            last_service: r.last_service ? formatDate(r.last_service) : null,
            next_due: r.next_due ? formatDate(r.next_due) : null,
            created_at: r.created_at ? formatDate(r.created_at) : null,
            updated_at: r.updated_at ? formatDate(r.updated_at) : null
        }));
        res.json(formatted);
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

    console.log("=== CREATE VEHICLE ===");
    console.log("req.body:", JSON.stringify(req.body));
    console.log("documents:", documents, "length:", documents ? documents.length : 0);
    console.log("maintenance:", maintenance, "length:", maintenance ? maintenance.length : 0);

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

        const insertedId = results.insertId;
        const newAssetId = `AST-${String(insertedId).padStart(3, '0')}`;

        // Wait for asset_id update to complete before proceeding
        const updateSql = "UPDATE vehicles SET asset_id = ? WHERE id = ?";
        db.query(updateSql, [newAssetId, insertedId], (updateErr) => {
            if (updateErr) {
                console.error("Error generating asset_id:", updateErr);
            }

            // Filter out documents without a name (check for non-empty string)
            const validDocuments = Array.isArray(documents) ? documents.filter(d => d && d.name && d.name.trim() !== '') : [];
            // Filter out maintenance without a type (check for non-empty string)
            const validMaintenance = Array.isArray(maintenance) ? maintenance.filter(m => m && m.maintenanceType && m.maintenanceType.trim() !== '') : [];

            console.log("=== AFTER FILTER ===");
            console.log("validDocuments:", JSON.stringify(validDocuments));
            console.log("validMaintenance:", JSON.stringify(validMaintenance));

            let docIndex = 0;
            const insertDocs = () => {
                if (!validDocuments || docIndex >= validDocuments.length) {
                    insertMaintenance();
                    return;
                }
                const doc = validDocuments[docIndex];
                console.log("Inserting document:", doc);
                const docSql = "INSERT INTO vehicle_documents (asset_id, name, issue_date, expiry_date, status, reminder_days) VALUES (?, ?, ?, ?, ?, ?)";
                db.query(docSql, [
                    newAssetId,
                    doc.name,
                    doc.issueDate || null,
                    doc.expiryDate || null,
                    doc.status || 'active',
                    doc.reminderDays || 30
                ], (docErr) => {
                    if (docErr) console.error("Error inserting document:", docErr);
                    docIndex++;
                    insertDocs();
                });
            };

            let maintIndex = 0;
            const insertMaintenance = () => {
                if (!validMaintenance || maintIndex >= validMaintenance.length) {
                    res.status(201).json({ message: "Vehicle created successfully", assetId: newAssetId });
                    return;
                }
                const maint = validMaintenance[maintIndex];
                console.log("Inserting maintenance:", maint);
                const maintSql = "INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
                db.query(maintSql, [
                    newAssetId,
                    maint.maintenanceType,
                    maint.lastService || null,
                    maint.nextDue || null,
                    maint.cost || null,
                    maint.reminderDays || 30,
                    maint.notes || null
                ], (maintErr) => {
                    if (maintErr) console.error("Error inserting maintenance:", maintErr);
                    maintIndex++;
                    insertMaintenance();
                });
            };

            // Start inserting documents (or skip if none)
            if (validDocuments.length === 0) {
                insertMaintenance();
            } else {
                insertDocs();
            }
        });
    });
});

// Update vehicle
router.put("/:assetId", (req, res) => {
    const { assetId } = req.params;
    const { name, chassisNumber, plateNumber, model, staffName, staffEmail, documents, maintenance } = req.body;

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

        const updateVehicle = () => {
            // If there are documents or maintenance to update, handle them
            if (documents || maintenance) {
                // Delete old documents and re-insert new ones
                if (documents) {
                    const validDocuments = documents.filter(d => d && d.name && d.name.trim() !== '');
                    // Delete existing documents first
                    db.query("DELETE FROM vehicle_documents WHERE asset_id = ?", [assetId], (delErr) => {
                        if (delErr) console.error("Error deleting documents:", delErr);
                        // Insert new documents
                        let docIndex = 0;
                        const insertDocs = () => {
                            if (docIndex >= validDocuments.length) {
                                handleMaintenance();
                                return;
                            }
                            const doc = validDocuments[docIndex];
                            const docSql = "INSERT INTO vehicle_documents (asset_id, name, issue_date, expiry_date, status, reminder_days) VALUES (?, ?, ?, ?, ?, ?)";
                            db.query(docSql, [assetId, doc.name, doc.issueDate || null, doc.expiryDate || null, doc.status || 'active', doc.reminderDays || 30], (docErr) => {
                                if (docErr) console.error("Error updating document:", docErr);
                                docIndex++;
                                insertDocs();
                            });
                        };
                        insertDocs();
                    });
                } else {
                    handleMaintenance();
                }

                const handleMaintenance = () => {
                    if (maintenance) {
                        const validMaintenance = maintenance.filter(m => m && m.maintenanceType && m.maintenanceType.trim() !== '');
                        // Delete existing maintenance and re-insert
                        db.query("DELETE FROM maintenance WHERE asset_id = ?", [assetId], (delErr) => {
                            if (delErr) console.error("Error deleting maintenance:", delErr);
                            let maintIndex = 0;
                            const insertMaint = () => {
                                if (maintIndex >= validMaintenance.length) {
                                    res.json({ message: "Vehicle updated successfully", assetId });
                                    return;
                                }
                                const maint = validMaintenance[maintIndex];
                                const maintSql = "INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
                                db.query(maintSql, [assetId, maint.maintenanceType, maint.lastService || null, maint.nextDue || null, maint.cost || null, maint.reminderDays || 30, maint.notes || null], (maintErr) => {
                                    if (maintErr) console.error("Error updating maintenance:", maintErr);
                                    maintIndex++;
                                    insertMaint();
                                });
                            };
                            insertMaint();
                        });
                    } else {
                        res.json({ message: "Vehicle updated successfully", assetId });
                    }
                };
            } else {
                res.json({ message: "Vehicle updated successfully", assetId });
            }
        };

        if (updateFields.length === 0) {
            // No vehicle fields to update, just update docs/maintenance
            updateVehicle();
            return;
        }

        updateValues.push(assetId);
        const sql = `UPDATE vehicles SET ${updateFields.join(", ")} WHERE asset_id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating vehicle", error: err });
            }
            updateVehicle();
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
    const sql = "SELECT id, asset_id, name, issue_date, expiry_date, status, reminder_days, uploaded_by, created_at, updated_at FROM vehicle_documents WHERE asset_id = ? ORDER BY id DESC";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching documents", error: err });
        }
        // Convert date objects to YYYY-MM-DD strings
        const formatDate = (d) => d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : d;
        const formatted = (results || []).map(r => ({
            ...r,
            issue_date: r.issue_date ? formatDate(r.issue_date) : null,
            expiry_date: r.expiry_date ? formatDate(r.expiry_date) : null
        }));
        res.json(formatted);
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

    // First get current document to know old expiry date
    const getSql = "SELECT expiry_date FROM vehicle_documents WHERE id = ?";

    db.query(getSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching document", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        const oldExpiryDate = results[0].expiry_date;

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

        // If expiry date changed and new expiry date provided, create renewal record
        const handleRenewal = (callback) => {
            // Format old expiry date for comparison
            const formatDate = (d) => d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : d;
            const oldDateStr = oldExpiryDate ? formatDate(oldExpiryDate) : null;

            if (expiryDate && oldDateStr && expiryDate !== oldDateStr) {
                const renewalSql = "INSERT INTO document_renewals (document_id, old_expiry_date, new_expiry_date) VALUES (?, ?, ?)";
                db.query(renewalSql, [id, oldDateStr, expiryDate], (renewalErr) => {
                    if (renewalErr) {
                        console.error("Error creating renewal:", renewalErr);
                    }
                    callback();
                });
            } else {
                callback();
            }
        };

        updateValues.push(id);
        const sql = `UPDATE vehicle_documents SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (updateErr, updateResults) => {
            if (updateErr) {
                return res.status(500).json({ message: "Error updating document", error: updateErr });
            }

            // Handle renewal if expiry date changed
            handleRenewal(() => {
                res.json({ message: "Document updated successfully" });
            });
        });
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
    const sql = "SELECT id, asset_id, maintenance_type, last_service, next_due, cost, reminder_days, notes, created_at, updated_at FROM maintenance WHERE asset_id = ? ORDER BY id DESC";

    db.query(sql, [assetId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching maintenance records", error: err });
        }
        // Convert date objects to YYYY-MM-DD strings
        const formatDate = (d) => d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : d;
        const formatted = (results || []).map(r => ({
            ...r,
            last_service: r.last_service ? formatDate(r.last_service) : null,
            next_due: r.next_due ? formatDate(r.next_due) : null
        }));
        res.json(formatted);
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

// ==================== DOCUMENT RENEWALS ====================

// Get all renewals for a document
router.get("/documents/:documentId/renewals", (req, res) => {
    const { documentId } = req.params;
    const sql = "SELECT * FROM document_renewals WHERE document_id = ? ORDER BY renewed_at DESC";

    db.query(sql, [documentId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching renewals", error: err });
        }
        res.json(results);
    });
});

// Create document renewal
router.post("/documents/:documentId/renewals", (req, res) => {
    const { documentId } = req.params;
    const { oldExpiryDate, newExpiryDate, renewedBy } = req.body;

    if (!newExpiryDate) {
        return res.status(400).json({ message: "New expiry date is required" });
    }

    const sql = "INSERT INTO document_renewals (document_id, old_expiry_date, new_expiry_date, renewed_by) VALUES (?, ?, ?, ?)";

    db.query(sql, [documentId, oldExpiryDate || null, newExpiryDate, renewedBy || null], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error creating renewal", error: err });
        }
        res.status(201).json({ message: "Renewal created successfully", renewalId: results.insertId });
    });
});

// ==================== BULK UPLOAD ====================

// Bulk upload vehicles with documents and maintenance
router.post("/bulk", (req, res) => {
    const { data, uploadedBy } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "No data provided" });
    }

    console.log("=== BULK UPLOAD ===");
    console.log("Records:", data.length);
    console.log("First record:", JSON.stringify(data[0]));

    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    // Process each record
    const processRecords = async () => {
        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            const rowNum = i + 1;

            try {
                // Map template columns to DB fields (handle various possible column names)
                const getValue = (obj, ...keys) => {
                    for (const key of keys) {
                        if (obj[key] !== undefined && obj[key] !== '') return obj[key];
                    }
                    return null;
                };

                const plateNumber = getValue(record, 'plate Number', 'plate_number', 'plate number', 'PLATE NUMBER');
                const chassisNumber = getValue(record, 'Chasis Number', 'chasis_number', 'Chassis Number', 'chassis number', 'CHASIS NUMBER');
                const vehicleName = getValue(record, 'Name of Vehicle', 'name', 'Name of Vehicle', 'NAME OF VEHICLE');
                const vehicleDescription = getValue(record, 'Vehicle Description', 'vehicle description', 'Vehicle Description', 'VEHICLE DESCRIPTION');
                const brand = getValue(record, 'Brand', 'brand', 'BRAND');
                const staffEmail = getValue(record, 'staff_email', 'staff email', 'email', 'STAFF_EMAIL');
                const sbu = getValue(record, 'SBU', 'sbu', 'SBU');
                const yearAcquired = getValue(record, 'Year Acquired', 'year acquired', 'Year Acquired', 'YEAR ACQUIRED');
                const color = getValue(record, 'Color', 'color', 'COLOR');

                const roadWorthinessExpiry = getValue(record, 'Road Worthiness Expiry', 'road worthiness expiry', 'Road Worthiness Expiry', 'ROAD WORTHINESS EXPIRY');
                const vehicleLicenseExpiry = getValue(record, 'Vehicle Lincense Expiry', 'Vehicle Lincense Expiry', 'vehicle license expiry', 'VEHICLE LINCENSE EXPIRY');
                const proofOfOwnership = getValue(record, 'Proof of Ownership', 'proof of ownership', 'Proof of Ownership', 'PROOF OF OWNERSHIP');
                const insuranceExpiry = getValue(record, 'Insurance Expiry', 'insurance expiry', 'Insurance Expiry', 'INSURANCE EXPIRY');

                const lastServicedDate = getValue(record, 'Last Serviced Date', 'last serviced date', 'Last Serviced Date', 'LAST SERVICED DATE');
                const nextServiceDate = getValue(record, 'Next Service Date', 'next service date', 'Next Service Date', 'NEXT SERVICE DATE');

                const vehicleModel = brand || vehicleDescription || yearAcquired || 'Unknown';

                if (!plateNumber) {
                    throw new Error('Plate number is required');
                }

                // Check if vehicle exists by plate_number
                const checkVehicleSql = "SELECT asset_id FROM vehicles WHERE plate_number = ?";
                let assetId;

                const vehicleExists = await new Promise((resolve, reject) => {
                    db.query(checkVehicleSql, [plateNumber], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (vehicleExists.length > 0) {
                    // Use existing vehicle
                    assetId = vehicleExists[0].asset_id;
                } else {
                    // Create new vehicle
                    const insertVehicleSql = "INSERT INTO vehicles (name, chassis_number, plate_number, model, staff_name, staff_email) VALUES (?, ?, ?, ?, ?, ?)";

                    await new Promise((resolve, reject) => {
                        db.query(insertVehicleSql, [vehicleName, chassisNumber, plateNumber, vehicleModel, sbu, staffEmail], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });

                    // Get the generated asset_id
                    const getAssetSql = "SELECT asset_id FROM vehicles WHERE plate_number = ?";
                    const newVehicle = await new Promise((resolve, reject) => {
                        db.query(getAssetSql, [plateNumber], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });

                    assetId = newVehicle[0].asset_id;
                }

                // Insert documents: Road Worthiness, Vehicle License, Proof of Ownership, Insurance
                const documents = [
                    { name: 'Road Worthiness', expiryDate: roadWorthinessExpiry },
                    { name: 'Vehicle License', expiryDate: vehicleLicenseExpiry },
                    { name: 'Proof of Ownership', expiryDate: proofOfOwnership },
                    { name: 'Insurance', expiryDate: insuranceExpiry },
                ];

                for (const doc of documents) {
                    if (doc.expiryDate) {
                        const insertDocSql = "INSERT INTO vehicle_documents (asset_id, name, expiry_date, status, reminder_days, uploaded_by) VALUES (?, ?, ?, 'active', ?, ?)";
                        await new Promise((resolve, reject) => {
                            db.query(insertDocSql, [assetId, doc.name, doc.expiryDate, 30, uploadedBy || null], (err, results) => {
                                if (err) reject(err);
                                else resolve(results);
                            });
                        });
                    }
                }

                // Insert maintenance if last serviced date provided
                if (lastServicedDate || nextServiceDate) {
                    const insertMaintSql = "INSERT INTO maintenance (asset_id, maintenance_type, last_service, next_due, reminder_days) VALUES (?, ?, ?, ?, ?)";
                    await new Promise((resolve, reject) => {
                        db.query(insertMaintSql, [assetId, 'General Service', lastServicedDate, nextServiceDate, 30], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });
                }

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ row: rowNum, error: error.message });
                console.error(`Error at row ${rowNum}:`, error.message);
            }
        }

        console.log("=== BULK UPLOAD COMPLETE ===");
        console.log("Success:", results.success, "Failed:", results.failed);

        res.json({
            message: `Bulk upload complete: ${results.success} successful, ${results.failed} failed`,
            success: results.success,
            failed: results.failed,
            errors: results.errors
        });
    };

    processRecords();
});

module.exports = router;