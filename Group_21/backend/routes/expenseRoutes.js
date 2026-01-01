import express from "express";
import {
  getAllExpense,
  updateExpense,
  addExpense,
  deleteExpense,
  getUpcomingExpenses,
} from "../controllers/expenseController.js";

import { protect } from "../middleware/authMiddleware.js";
import { accountContext } from "../middleware/accountContext.js";
const router = express.Router();

router.post("/add", protect, accountContext, addExpense);
router.get("/get", protect, accountContext, getAllExpense);
router.put("/:id", protect, accountContext, updateExpense);
router.delete("/:id", protect, accountContext, deleteExpense);
router.get("/upcomingExpenses", protect, accountContext, getUpcomingExpenses);

export default router;
