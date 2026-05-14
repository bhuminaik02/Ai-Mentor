// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB, sequelize } from "./config/db.js";

// ================= ROUTES =================
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import paymentRoutes from "./routes/payment.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import contactUsRoutes from "./routes/contactus.js";

// ================= MODELS =================
import "./models/CommunityPost.js";
import "./models/Notification.js";
import "./models/Report.js";
import "./models/modelAssociations.js";
import "./models/contactMessage.js";

// ================= CONFIG =================
dotenv.config();

/* =========================
   ENVIRONMENT VARIABLES CHECK
========================= */

const requiredEnvVars = [
  "GEMINI_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingKeys = [];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.log(`❌ ${key} is missing`);
    missingKeys.push(key);
  }
});

if (missingKeys.length === 0) {
  console.log("✅ All environment variables loaded successfully");
} else {
  console.log("\n⚠ Missing Environment Variables:");
  missingKeys.forEach((key) => {
    console.log(`➡ ${key}`);
  });

  console.log("\n❌ Server may not work properly.\n");
}

// ✅ FIX: define environment flag
const isDevelopment = process.env.NODE_ENV !== "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ================= STATIC FILES =================
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/contactus", contactUsRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // ✅ Better sync handling
    const syncOptions = isDevelopment ? { alter: true } : {};
    await sequelize.sync(syncOptions);

    console.log(
      isDevelopment
        ? "✅ Database synced (development - alter enabled)"
        : "✅ Database synced (production)"
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
};

startServer();