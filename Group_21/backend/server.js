import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import path from "path";
import financeRoutes from "./routes/financeRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Configure environment variables
dotenv.config();

const app = express();
app.use(cors());

// CORS Configuration
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173", // Match frontend port
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true
//   })
// );

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
// Serve uploaded images statically
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads")),
);
// Profile routes
app.use("/api/v1/profile", profileRoutes);

// Finance Route
app.use("/api/v1/finances", financeRoutes);
// Accounts & Invitations
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1", invitationRoutes);

// Notification
app.use("/api/v1/notifications", notificationRoutes);

// Server setup
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
