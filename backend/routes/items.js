const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Helper function to generate auto-incrementing item_code
const generateItemCode = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT item_code FROM items ORDER BY id DESC LIMIT 1";
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
                return resolve("ITEM001");
            }
            const lastCode = results[0].item_code;
            const lastNumber = parseInt(lastCode.replace('ITEM', ''));
            const newNumber = lastNumber + 1;
            resolve(`ITEM${String(newNumber).padStart(3, '0')}`);
        });
    });
};

// Helper function to get status based on quantity and min_stock_level
const getStatus = (quantity, minStock) => {
    if (quantity === 0) return 'out';
    if (quantity <= minStock) return 'low';
    return 'available';
};

// Get all items
router.get("/", (req, res) => {
    const { officer_type } = req.query;

    let sql = `
        SELECT i.*, c.name as category_name,
               CASE
                   WHEN i.quantity = 0 THEN 'out'
                   WHEN i.quantity <= i.min_stock_level THEN 'low'
                   ELSE 'available'
               END as status
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
    `;

    const params = [];

    if (officer_type && officer_type !== 'all') {
        sql += " WHERE i.officer_type = ? OR i.officer_type = 'both'";
        params.push(officer_type);
    }

    sql += " ORDER BY i.id DESC";

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching items", error: err });
        }
        res.json(results);
    });
});

// Get single item by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT i.*, c.name as category_name,
               CASE
                   WHEN i.quantity = 0 THEN 'out'
                   WHEN i.quantity <= i.min_stock_level THEN 'low'
                   ELSE 'available'
               END as status
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching item", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(results[0]);
    });
});

// Create new item
router.post("/", async (req, res) => {
    const { name, description, categoryId, unit, quantity, minStock, officerType } = req.body;

    if (!name || !categoryId) {
        return res.status(400).json({ message: "Name and category are required" });
    }

    try {
        const itemCode = await generateItemCode();
        const qty = quantity || 0;
        const min = minStock || 5;
        const status = getStatus(qty, min);
        const officerTypeValue = officerType || 'both';

        const sql = "INSERT INTO items (item_code, name, description, category_id, unit, quantity, min_stock_level, officer_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        db.query(sql, [itemCode, name, description || null, categoryId, unit || 'pcs', qty, min, officerTypeValue], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error creating item", error: err });
            }
            res.status(201).json({ message: "Item created successfully", itemId: results.insertId, itemCode });
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating item code", error: error });
    }
});

// Update item
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, categoryId, unit, quantity, minStock, status, officerType } = req.body;

    // Check if item exists
    const checkSql = "SELECT id FROM items WHERE id = ?";
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking item", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (name) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }
        if (description !== undefined) {
            updateFields.push("description = ?");
            updateValues.push(description);
        }
        if (categoryId) {
            updateFields.push("category_id = ?");
            updateValues.push(categoryId);
        }
        if (unit) {
            updateFields.push("unit = ?");
            updateValues.push(unit);
        }
        if (quantity !== undefined) {
            updateFields.push("quantity = ?");
            updateValues.push(quantity);
        }
        if (minStock !== undefined) {
            updateFields.push("min_stock_level = ?");
            updateValues.push(minStock);
        }
        if (officerType) {
            updateFields.push("officer_type = ?");
            updateValues.push(officerType);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(id);
        const sql = `UPDATE items SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(sql, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating item", error: err });
            }
            res.json({ message: "Item updated successfully" });
        });
    });
});

// Delete item
// Check item for associated records
router.get("/check/:id", (req, res) => {
    const { id } = req.params;

    const checkStockIn = "SELECT COUNT(*) as count FROM stock_in WHERE item_id = ?";
    const checkStockOut = "SELECT COUNT(*) as count FROM stock_out WHERE item_id = ?";

    db.query(checkStockIn, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        const stockInCount = results[0].count;

        db.query(checkStockOut, [id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const stockOutCount = results[0].count;

            res.json({
                hasRecords: stockInCount > 0 || stockOutCount > 0,
                stockInCount,
                stockOutCount,
                totalRecords: stockInCount + stockOutCount
            });
        });
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Delete stock transactions first
    const deleteStockIn = "DELETE FROM stock_in WHERE item_id = ?";
    const deleteStockOut = "DELETE FROM stock_out WHERE item_id = ?";

    db.query(deleteStockIn, [id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting stock-in records", error: err });
        }

        db.query(deleteStockOut, [id], (err) => {
            if (err) {
                return res.status(500).json({ message: "Error deleting stock-out records", error: err });
            }

            const sql = "DELETE FROM items WHERE id = ?";
            db.query(sql, [id], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error deleting item", error: err });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "Item not found" });
                }
                res.json({ message: "Item deleted successfully" });
            });
        });
    });
});

module.exports = router;