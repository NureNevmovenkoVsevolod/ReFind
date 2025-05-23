import Payment from "../models/payments.model.js";
import Advertisement from "../models/advertisement.model.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export const createPayment = async (req, res) => {
  try {
    const { advertisement_id, payment_data } = req.body;
    const userId = req.user.id;

    if (!advertisement_id || !payment_data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const advertisement = await Advertisement.findOne({
      where: { advertisement_id: advertisement_id, user_id: userId },
    });

    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found or does not belong to user",
      });
    }

    // Створюємо запис про платіж
    const payment = await Payment.create({
      user_id: userId,
      advertisement_id: advertisement_id,
      amount: 50,
      status: "completed",
      payment_reference: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_url: payment_data.paymentMethodData?.type || 'CARD',
    });

    console.log(
      `Payment saved successfully for advertisement ID: ${advertisement_id}`
    );
    
    res.status(201).json({ 
      message: "Payment saved successfully", 
      payment: payment 
    });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ 
      message: "Failed to save payment", 
      error: error.message 
    });
  }
};
