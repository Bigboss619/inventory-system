const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all stock in records
router.get("/", (req, res) => {
    const sql = `
        SELECT s.id, s.item_id, s.quantity, s.supplier, s.note, s.received_by, s.transaction_date,
               i.name as item_name, i.item_code,
               CONCAT(u.first_name, ' ', u.last_name) as received_by_name
        FROM stock_in s
        LEFT JOIN items i ON s.item_id = i.id
        LEFT JOIN users u ON s.received_by = u.id
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("StockIn GET Error:", err);
            return res.status(500).json({ message: "Error fetching stock in records", error: err.message });
        }
        res.json(results);
    });
});

// Get single stock in record by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, i.name as item_name, i.item_code
        FROM stock_in s
        LEFT JOIN items i ON s.item_id = i.id
        WHERE s.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock in record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock in record not found" });
        }
        res.json(results[0]);
    });
});

// Create new stock in record
router.post("/", (req, res) => {
    const { itemId, quantity, supplier, note, transactionDate } = req.body;
    const receivedBy = req.headers["user-id"];

    if (!itemId || !quantity) {
        return res.status(400).json({ message: "Item and quantity are required" });
    }

    if (!receivedBy) {
        return res.status(401).json({ message: "Unauthorized - user ID not found" });
    }

    console.log("Creating stock_in with:", { itemId, quantity, supplier, note, receivedBy, transactionDate });

    const sql = "INSERT INTO stock_in (item_id, quantity, supplier, note, received_by, transaction_date) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [itemId, quantity, supplier || null, note || null, receivedBy, transactionDate || new Date().toLocaleDateString('en-CA')], (err, results) => {
        if (err) {
            console.error("StockIn POST Error:", err);
            return res.status(500).json({ message: "Error creating stock in record", error: err.message });
        }

        // Update item quantity
        const updateQtySql = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
        db.query(updateQtySql, [quantity, itemId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating item quantity:", updateErr);
            }
        });

        res.status(201).json({ message: "Stock in recorded successfully", stockInId: results.insertId });
    });
});

// Update stock in record
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { quantity, supplier, note, transactionDate } = req.body;

    // Get current record to calculate quantity difference
    const getSql = "SELECT item_id, quantity FROM stock_in WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock in record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock in record not found" });
        }

        const oldItemId = results[0].item_id;
        const oldQuantity = results[0].quantity;
        const newQuantity = quantity || oldQuantity;

        // Calculate quantity difference
        const qtyDiff = newQuantity - oldQuantity;

        // Update stock in record
        const updateSql = "UPDATE stock_in SET quantity = ?, supplier = ?, note = ?, transaction_date = ? WHERE id = ?";
        db.query(updateSql, [newQuantity, supplier, note, transactionDate, id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: "Error updating stock in record", error: updateErr });
            }

            // Adjust item quantity
            if (qtyDiff !== 0) {
                const adjustQtySql = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
                db.query(adjustQtySql, [qtyDiff, oldItemId], (adjustErr) => {
                    if (adjustErr) {
                        console.error("Error adjusting item quantity:", adjustErr);
                    }
                });
            }

            res.json({ message: "Stock in record updated successfully" });
        });
    });
});

// Delete stock in record
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Get record to reverse quantity
    const getSql = "SELECT item_id, quantity FROM stock_in WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stock in record", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Stock in record not found" });
        }

        const itemId = results[0].item_id;
        const quantity = results[0].quantity;

        // Delete record
        const deleteSql = "DELETE FROM stock_in WHERE id = ?";
        db.query(deleteSql, [id], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json({ message: "Error deleting stock in record", error: deleteErr });
            }

            // Reverse the quantity increase
            const reverseQtySql = "UPDATE items SET quantity = quantity - ? WHERE id = ?";
            db.query(reverseQtySql, [quantity, itemId], (reverseErr) => {
                if (reverseErr) {
                    console.error("Error reversing item quantity:", reverseErr);
                }
            });

            res.json({ message: "Stock in record deleted successfully" });
        });
    });
});

module.exports = router;