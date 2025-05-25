import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadAvatar, uploadImages } from "../controllers/upload.controller.js";

const router = express.Router();

// Handle multiple image uploads
router.post(
  "/images",
  verifyToken,
  upload.array("images", 5),
  uploadImages
);

// Завантаження аватара
router.post(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  uploadAvatar
);

export default router;
