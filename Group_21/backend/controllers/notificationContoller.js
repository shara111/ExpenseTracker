import Notification from "../models/Notification.js";
import { formatDistanceToNow } from "date-fns";

export const handleNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const notification = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedNotification = notification.map((notification) => ({
      ...notification,
      timeAgo: formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
      }),
      data: {
        ...notification.data,
        amount: notification.data.amount ? notification.data.amount : null,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedNotification.length,
      data: formattedNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    const notification = await Notification.create({
      user: userId,
      type,
      data: {
        ...data,
        timeAgo: formatDistanceToNow(new Date(), { addSuffix: true }),
      },
      readAt: null,
      expiresAt: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    });
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};
