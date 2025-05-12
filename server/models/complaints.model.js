import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Complaint = sequelize.define(
  "Complaint",
  {
    complaint_id: {
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
    complaints_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    complaint_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    complaint_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "complaints",
    timestamps: true,
  }
);

export default Complaint;
