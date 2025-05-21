import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/create", paymentController.createPayment);

export default router;
