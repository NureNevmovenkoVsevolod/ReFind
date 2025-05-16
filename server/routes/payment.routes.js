import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

// Create payment for lost item advertisement
router.post("/create", paymentController.createPayment);

// Verify payment status
router.post("/verify", paymentController.verifyPayment);

export default router;
