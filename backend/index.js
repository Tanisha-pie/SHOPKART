require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";

// Middleware: Allow any localhost port (5173, 5174, 3000, etc.) with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback allow in development
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Database connection check middleware
let isDbConnected = false;
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/health") return next();
  if (!isDbConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection is not ready. Please ensure MongoDB is running or check MONGO_URI.",
    });
  }
  next();
});

// Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Root & Health routes
app.get("/", (req, res) => {
  res.send("ShopKart Backend API is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Start Express server immediately so ports are open
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    isDbConnected = false;
    console.error("MongoDB connection error:", err.message);
    console.error("Tip: Ensure your local MongoDB service is started, or update MONGO_URI in .env with your MongoDB Atlas connection string.");
  });

module.exports = app;
