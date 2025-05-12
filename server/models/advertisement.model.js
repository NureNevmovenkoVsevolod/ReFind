import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Advertisement = sequelize.define(
  "Advertisement",
  {
    advertisement_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categorie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_coordinates: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reward: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mod_check: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "advertisements",
    timestamps: true,
  }
);

export default Advertisement;
