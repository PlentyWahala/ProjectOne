require("dotenv").config();

const express = require("express");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

app.use(express.json());

app.use((req, res, next) => {
  if (LOG_LEVEL === "debug") {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
      env: process.env.NODE_ENV,
      logLevel: LOG_LEVEL
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
