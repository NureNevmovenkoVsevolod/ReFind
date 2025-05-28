import express from "express";
import PaymentController from "../controllers/payment.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/create", PaymentController.createPayment);

export default router;
