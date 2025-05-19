import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Handle multiple image uploads
router.post(
  "/images",
  verifyToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Create URLs for uploaded files
      const imageUrls = req.files.map(
        (file) => `/static/uploads/${file.filename}`
      );

      res.json({ imageUrls });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  }
);

export default router;
