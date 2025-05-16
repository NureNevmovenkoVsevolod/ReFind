import express from "express";
import * as advertisementController from "../controllers/advertisement.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(verifyToken);
router.post("/", advertisementController.createAdvertisement);
router.get("/user/my", advertisementController.getUserAdvertisements);
router.put("/:id", advertisementController.updateAdvertisement);
router.delete("/:id", advertisementController.deleteAdvertisement);

// Public routes
router.get("/finds", advertisementController.getFinds);
router.get("/losses", advertisementController.getLosses);
router.get("/:id", advertisementController.getAdvertisementById);

export default router;
