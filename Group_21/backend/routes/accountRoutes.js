import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { accountContext, ownerOnly } from "../middleware/accountContext.js";
import {
  createSharedAccount,
  getMyAccounts,
  listMembers,
  removeMember,
  deleteAccount,
} from "../controllers/accountController.js";

const router = express.Router();

// list my accounts (no accountContext needed)
router.get("/mine", protect, getMyAccounts);

// create a shared account
router.post("/", protect, createSharedAccount);

// members of current account
router.get(
  "/:id/members",
  protect,
  async (req, res, next) => {
    req.headers["x-account-id"] = req.params.id;
    next();
  },
  accountContext,
  listMembers,
);

// owner-only actions
router.delete(
  "/:id/members/:userId",
  protect,
  async (req, res, next) => {
    req.headers["x-account-id"] = req.params.id;
    next();
  },
  accountContext,
  ownerOnly,
  removeMember,
);
router.delete(
  "/:id",
  protect,
  async (req, res, next) => {
    req.headers["x-account-id"] = req.params.id;
    next();
  },
  accountContext,
  ownerOnly,
  deleteAccount,
);

export default router;
