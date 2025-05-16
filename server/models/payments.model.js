import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    advertisement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "completed", "failed", "cancelled"]],
      },
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    payment_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;
