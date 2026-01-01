import express from "express";
import {
  addIncome,
  getAllIncome,
  deleteIncome,
  updateIncome,
  getUpcomingIncome,
} from "../controllers/incomeContoller.js";
import { protect } from "../middleware/authMiddleware.js";
import { accountContext } from "../middleware/accountContext.js";
const router = express.Router();

router.post("/add", protect, accountContext, addIncome);
router.get("/get", protect, accountContext, getAllIncome);
router.delete("/:id", protect, accountContext, deleteIncome);
router.put("/:id", protect, accountContext, updateIncome);
router.get("/upcomingIncome", protect, accountContext, getUpcomingIncome);

export default router;
