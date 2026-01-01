import express from "express";
import {
  getUserInfo,
  loginUser,
  registerUser,
  getFinancialData,
  getExpenses,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Existing routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// New mock routes
router.get("/financial-data", protect, getFinancialData);
router.get("/expenses", protect, getExpenses);

export default router;
