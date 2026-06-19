const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all stock out records
router.get("/", (req, res) => {
    const sql = `
        SELECT s.id, s.item_id, s.quantity, s.note, s.transaction_date,
               s.requested_by, s.issued_by,
               i.name as item_name, i.item_code,
               d.name as department_name,
               CONCAT(req.first_name, ' ', req.last_name) as requested_by_name,
               CONCAT(iss.first_name, ' ', iss.last_name) as issued_by_name
        FROM stock_out s
        LEFT JOIN items i ON s.item_id = i.id
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN staff req ON s.requested_by = req.id
        LEFT JOIN users iss ON s.issued_by = iss.id
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("StockOut GET Error:", err);
            return res.status(500).json({ message: "Error fetching stock out records", error: err.message });
        }
        res.json(results);
    });
});

// Get single stock out record by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, i.name as item_name, i.item_code
        FROM stock_out s
        LEFT JOIN items i ON s.item_id = i.id
        WHERE s.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock out record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock out record not found" });
        }
        res.json(results[0]);
    });
});

// Create new stock out record
router.post("/", (req, res) => {
    const { itemId, quantity, departmentId, requestedBy, issuedBy, note, transactionDate } = req.body;

    if (!itemId || !quantity || !departmentId) {
        return res.status(400).json({ message: "Item, quantity, and department are required" });
    }

    console.log("Creating stock_out with:", { itemId, quantity, departmentId, requestedBy, issuedBy, note, transactionDate });

    const sql = "INSERT INTO stock_out (item_id, quantity, department_id, requested_by, issued_by, note, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [itemId, quantity, departmentId, requestedBy || null, issuedBy || null, note || null, transactionDate || new Date().toISOString().split('T')[0]], (err, results) => {
        if (err) {
            console.error("StockOut POST Error:", err);
            return res.status(500).json({ message: "Error creating stock out record", error: err.message });
        }

        // Update item quantity (decrease)
        const updateQtySql = "UPDATE items SET quantity = quantity - ? WHERE id = ?";
        db.query(updateQtySql, [quantity, itemId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating item quantity:", updateErr);
            }
        });

        res.status(201).json({ message: "Stock out recorded successfully", stockOutId: results.insertId });
    });
});

// Update stock out record
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { quantity, note, transactionDate } = req.body;

    // Get current record to calculate quantity difference
    const getSql = "SELECT item_id, quantity FROM stock_out WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock out record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock out record not found" });
        }

        const itemId = results[0].item_id;
        const oldQuantity = results[0].quantity;
        const newQuantity = quantity || oldQuantity;

        // Calculate quantity difference
        const qtyDiff = oldQuantity - newQuantity;

        // Update stock out record
        const updateSql = "UPDATE stock_out SET quantity = ?, note = ?, transaction_date = ? WHERE id = ?";
        db.query(updateSql, [newQuantity, note, transactionDate, id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: "Error updating stock out record", error: updateErr });
            }

            // Adjust item quantity (if quantity increased, decrease more; if decreased, add back)
            if (qtyDiff !== 0) {
                const adjustQtySql = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
                db.query(adjustQtySql, [qtyDiff, itemId], (adjustErr) => {
                    if (adjustErr) {
                        console.error("Error adjusting item quantity:", adjustErr);
                    }
                });
            }

            res.json({ message: "Stock out record updated successfully" });
        });
    });
});

// Delete stock out record
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Get record to restore quantity
    const getSql = "SELECT item_id, quantity FROM stock_out WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock out record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock out record not found" });
        }

        const itemId = results[0].item_id;
        const quantity = results[0].quantity;

        // Delete record
        const deleteSql = "DELETE FROM stock_out WHERE id = ?";
        db.query(deleteSql, [id], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json({ message: "Error deleting stock out record", error: deleteErr });
            }

            // Restore the quantity back to items
            const restoreQtySql = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
            db.query(restoreQtySql, [quantity, itemId], (restoreErr) => {
                if (restoreErr) {
                    console.error("Error restoring item quantity:", restoreErr);
                }
            });

            res.json({ message: "Stock out record deleted successfully" });
        });
    });
});

module.exports = router;