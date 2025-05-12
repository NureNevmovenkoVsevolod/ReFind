import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    review_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
    user_reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_reviewed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: false,
  }
);

export default Review;
