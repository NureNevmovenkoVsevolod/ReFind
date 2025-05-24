import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import bcrypt from "bcrypt";


const Mod = sequelize.define(
  "Mod",
  {
    mod_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mod_login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mod_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "mod",
    timestamps: false,
  }
);

export default Mod;
