const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env.development" });

const db = require("./config/config");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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