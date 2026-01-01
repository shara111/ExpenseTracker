import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  updateName,
  updatePassword,
  updateProfilePicture,
} from "../controllers/profileController.js";

const router = express.Router();

// Ensure upload directory exists
const uploadsDir = path.join(process.cwd(), "backend", "uploads", "profile");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(
      null,
      req.user?.id
        ? `${req.user.id}-${uniqueSuffix}${ext}`
        : `${uniqueSuffix}${ext}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Routes
router.put("/name", protect, updateName);
router.put("/password", protect, updatePassword);
router.put("/picture", protect, upload.single("picture"), updateProfilePicture);

export default router;
