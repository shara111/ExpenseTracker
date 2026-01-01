import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { accountContext } from "../middleware/accountContext.js";
import {
  getYears,
  addYear,
  deleteYear,
  getIncomeByYear,
  getExpenseByYear,
  createIncome,
  updateIncome,
  deleteIncome,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/financeController.js";

const router = express.Router();

// Year management
router.get("/years", protect, accountContext, getYears);
router.post("/years", protect, accountContext, addYear);
router.delete("/years/:year", protect, accountContext, deleteYear);

// Year data
router.get("/income/:year", protect, accountContext, getIncomeByYear);
router.get("/expense/:year", protect, accountContext, getExpenseByYear);

// Month-scoped Income
router.post("/:year/:month/incomes", protect, accountContext, createIncome);
router.patch(
  "/:year/:month/incomes/:incomeId",
  protect,
  accountContext,
  updateIncome,
);
router.delete(
  "/:year/:month/incomes/:incomeId",
  protect,
  accountContext,
  deleteIncome,
);

// Month-scoped Expense
router.post("/:year/:month/expenses", protect, accountContext, createExpense);
router.patch(
  "/:year/:month/expenses/:expenseId",
  protect,
  accountContext,
  updateExpense,
);
router.delete(
  "/:year/:month/expenses/:expenseId",
  protect,
  accountContext,
  deleteExpense,
);

export default router;
