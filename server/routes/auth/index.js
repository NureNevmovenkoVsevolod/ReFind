import express from "express";
import localRoutes from "./local.routes.js";
import googleRoutes from "./google.routes.js";
import facebookRoutes from "./facebook.routes.js";

const router = express.Router();

// Локальна авторизація
router.use("/", localRoutes);

// Google OAuth
router.use("/google", googleRoutes);

// Facebook OAuth
router.use("/facebook", facebookRoutes);

export default router;
