import express from "express";
import * as advertisementController from "../controllers/advertisement.controller.js";

const router = express.Router();

router.get("/finds", advertisementController.getFinds);
router.get("/losses", advertisementController.getLosses);

export default router;
