import express from "express";
import * as advertisementController from "../controllers/advertisement.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import checkBlocked from "../middlewares/checkBlocked.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/finds", advertisementController.getFinds);
router.get("/losses", advertisementController.getLosses);
router.get('/moderation', verifyToken, advertisementController.getAdvertisementsForModeration);
router.get("/:id", advertisementController.getAdvertisementById);

router.use(verifyToken);
router.use(checkBlocked);

router.put('/:id/moderate', advertisementController.moderateAdvertisement);

// Other protected routes
router.get("/user/my", advertisementController.getUserAdvertisements);
router.post(
  "/",
  upload.array("images", 5),
  advertisementController.createAdvertisement
);
router.post(
  "/:advertisement_id/images",
  upload.array("images", 5),
  advertisementController.addImagesToAdvertisement
);
router.put("/:id", advertisementController.updateAdvertisement);
router.delete("/:id", advertisementController.deleteAdvertisement);

export default router;
