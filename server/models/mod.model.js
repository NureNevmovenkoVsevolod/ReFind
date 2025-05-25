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
    mod_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mod_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "mod",
    timestamps: false,
    hooks: {
      beforeCreate: async (mod) => {
        if (mod.mod_password) {
          mod.mod_password = await bcrypt.hash(mod.mod_password, 5);
        }
      },
      beforeUpdate: async (mod) => {
        if (mod.changed("mod_password")) {
          mod.mod_password = await bcrypt.hash(mod.mod_password, 5);
        }
 
      },
    },
  }
);

Mod.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mod_password);
};

export default Mod;
