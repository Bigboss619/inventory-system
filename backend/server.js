const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/config");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Inventory Management API is running...");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, results) => {
        if (err) {
            console.error("Error querying the database:", err);
            res.status(500).send("Error querying the database");
            return;
        }
        res.send("Database connection successful!");
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});