import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Image = sequelize.define(
  "Image",
  {
    image_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    advertisement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
  },
  {
    tableName: "images",
    timestamps: true,
  }
);

export default Image;
