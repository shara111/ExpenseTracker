import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

// Update user's full name
export const updateName = async (req, res) => {
  const { fullName } = req.body;
  if (!fullName || String(fullName).trim().length === 0) {
    return res.status(400).json({ message: "Full name is required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName: String(fullName).trim() },
      { new: true, runValidators: true, context: "query" },
    ).select("-password");

    return res.json({
      message: "Name updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update name", error: error.message });
  }
};

// Update user's password (requires currentPassword and newPassword)
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update password", error: error.message });
  }
};

// Update user's profile picture
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No picture uploaded" });
    }

    const relativePath = path.posix.join("/uploads/profile", req.file.filename);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImageURL: relativePath },
      { new: true },
    ).select("-password");

    return res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to update profile picture",
        error: error.message,
      });
  }
};
