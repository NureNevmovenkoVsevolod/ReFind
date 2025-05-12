import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Category = sequelize.define(
  "Category",
  {
    categorie_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categorie_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
