import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { accountContext, ownerOnly } from "../middleware/accountContext.js";
import {
  createInvitation,
  listInvitationsForMe,
  acceptInvitation,
  declineInvitation,
  listNotifications,
  markNotificationRead,
} from "../controllers/invitationController.js";

const router = express.Router();

// owner: create invitation for account
router.post(
  "/accounts/:id/invite",
  protect,
  async (req, res, next) => {
    req.headers["x-account-id"] = req.params.id;
    next();
  },
  accountContext,
  ownerOnly,
  createInvitation,
);

// invitee list
router.get("/invitations", protect, listInvitationsForMe);

// invitee actions
router.post("/invitations/:invitationId/accept", protect, acceptInvitation);
router.post("/invitations/:invitationId/decline", protect, declineInvitation);

// notifications (simple)
router.get("/notifications", protect, listNotifications);
router.post("/notifications/:id/read", protect, markNotificationRead);

export default router;
