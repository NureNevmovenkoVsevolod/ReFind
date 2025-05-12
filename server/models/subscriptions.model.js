import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Subscription = sequelize.define(
  "Subscription",
  {
    subscription_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categorie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscription_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subscribed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
  }
);

export default Subscription;
