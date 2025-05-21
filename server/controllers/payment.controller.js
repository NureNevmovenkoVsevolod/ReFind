import Payment from "../models/payments.model.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export const createPayment = async (req, res) => {
  try {
    const { advertisement_id } = req.body;
    const userId = req.user.id;

    if (!advertisement_id) {
      return res.status(400).json({ message: "Missing advertisement_id" });
    }

    const advertisement = await Advertisement.findOne({
      where: { advertisement_id: advertisement_id, user_id: userId },
    });

    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found or does not belong to user",
      });
    }

    const testReference = `test_gp_${advertisement_id}_${Date.now()}`;
    const testPaymentUrl = "test_google_pay_url";

    const payment = await Payment.create({
      user_id: userId,
      advertisement_id: advertisement_id,
      amount: 50,
      status: "completed",
      payment_reference: testReference,
      payment_url: testPaymentUrl,
    });
    console.log(
      `Test payment saved successfully for advertisement ID: ${advertisement_id}`
    );
    res
      .status(201)
      .json({ message: "Test payment saved successfully", payment: payment });
  } catch (error) {
    console.error("Error saving test payment:", error);
    res
      .status(500)
      .json({ message: "Failed to save test payment", error: error.message });
  }
};
