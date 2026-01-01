import express from "express";
import {
  createNotification,
  deleteNotification,
  handleNotification,
  markAsRead,
} from "../controllers/notificationContoller.js";

const router = express.Router();

router.get("/:userId", handleNotification);
router.post("/create", createNotification);
router.delete("/:notificationId", deleteNotification);
router.put("/:notificationId", markAsRead);

export default router;
