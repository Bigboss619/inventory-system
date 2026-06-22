const express = require("express");
const db = require("../config/config");

const router = express.Router();

// Get all categories
router.get("/", (req, res) => {
    const sql = "SELECT c.*, COUNT(i.id) as items_count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.id ORDER BY c.id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching categories", error: err });
        }
        res.json(results);
    });
});

// Get single category by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT c.*, COUNT(i.id) as items_count FROM categories c LEFT JOIN items i ON c.id = i.category_id WHERE c.id = ? GROUP BY c.id";

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching category", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(results[0]);
    });
});

// Create new category
router.post("/", (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required" });
    }

    const sql = "INSERT INTO categories (name, description) VALUES (?, ?)";

    db.query(sql, [name, description], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Category already exists" });
            }
            return res.status(500).json({ message: "Error creating category", error: err });
        }
        res.status(201).json({ message: "Category created successfully", categoryId: results.insertId });
    });
});

// Update category
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required" });
    }

    const sql = "UPDATE categories SET name = ?, description = ? WHERE id = ?";

    db.query(sql, [name, description, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error updating category", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category updated successfully" });
    });
});

// Delete category
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Get all items in this category
    const getItems = "SELECT id FROM items WHERE category_id = ?";
    db.query(getItems, [id], (err, items) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching items", error: err });
        }

        // Delete stock transactions for each item, then delete items
        const deleteStockIn = "DELETE FROM stock_in WHERE item_id = ?";
        const deleteStockOut = "DELETE FROM stock_out WHERE item_id = ?";
        const deleteItems = "DELETE FROM items WHERE category_id = ?";
        const deleteCategory = "DELETE FROM categories WHERE id = ?";

        const deleteAll = async () => {
            for (const item of items) {
                await new Promise((resolve, reject) => {
                    db.query(deleteStockIn, [item.id], (err) => {
                        if (err) return reject(err);
                        db.query(deleteStockOut, [item.id], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            }

            db.query(deleteItems, [id], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error deleting items", error: err });
                }

                db.query(deleteCategory, [id], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: "Error deleting category", error: err });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ message: "Category not found" });
                    }
                    res.json({ message: "Category deleted successfully" });
                });
            });
        };

        deleteAll();
    });
});

module.exports = router;