import Payment from "../models/payments.model.js";
import Advertisement from "../models/advertisement.model.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const MONOBANK_API_URL = "https://api.monobank.ua";

export const createPayment = async (req, res) => {
  try {
    const { advertisement_id } = req.body;

    // Find the advertisement
    const advertisement = await Advertisement.findOne({
      where: { advertisement_id },
    });

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    // Create payment amount (fixed fee for lost items)
    const amount = 5000; // 50 UAH in kopeks

    // Generate unique payment reference
    const reference = `lost_${advertisement_id}_${Date.now()}`;

    // Create payment in Monobank
    const response = await axios.post(
      `${MONOBANK_API_URL}/api/merchant/invoice/create`,
      {
        amount,
        ccy: 980, // UAH currency code
        merchantPaymInfo: {
          reference,
          destination: "Lost item advertisement fee",
          basketOrder: [
            {
              name: "Advertisement fee",
              qty: 1,
              sum: amount,
              icon: "💰",
            },
          ],
        },
      },
      {
        headers: {
          "X-Token": process.env.MONOBANK_API_KEY,
        },
      }
    );

    // Create payment record in database
    const payment = await Payment.create({
      user_id: req.user.id,
      advertisement_id,
      amount,
      status: "pending",
      payment_reference: reference,
      payment_url: response.data.pageUrl,
    });

    res.json({
      payment_id: payment.payment_id,
      payment_url: response.data.pageUrl,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { payment_reference } = req.body;

    // Verify payment status with Monobank
    const response = await axios.get(
      `${MONOBANK_API_URL}/api/merchant/invoice/status?invoiceId=${payment_reference}`,
      {
        headers: {
          "X-Token": process.env.MONOBANK_API_KEY,
        },
      }
    );

    // Update payment status in database
    const payment = await Payment.findOne({
      where: { payment_reference },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const status = response.data.status === "success" ? "completed" : "failed";

    await payment.update({ status });

    // If payment is successful, update advertisement status
    if (status === "completed") {
      await Advertisement.update(
        { mod_check: true },
        { where: { advertisement_id: payment.advertisement_id } }
      );
    }

    res.json({ status });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
