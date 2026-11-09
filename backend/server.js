const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://amityadav92.github.io"
];

app.use(cors({
    origin: function (origin, callback) {

        // Allow requests without origin (Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());

// =====================================
// ROOT ROUTE
// =====================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Expense Tracker API is Running!"
    });
});

// =====================================
// API ROUTES
// =====================================

app.use(
    "/api/transactions",
    require("./routes/transactionRoutes")
);

// =====================================
// ERROR HANDLING
// =====================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// =====================================
// SERVER CONFIGURATION
// =====================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error(
            "Server Startup Failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();