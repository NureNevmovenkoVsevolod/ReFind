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
    hooks: {
      beforeCreate: async (mod) => {
        if (mod.password) {
          mod.password = await bcrypt.hash(mod.password, 5);
        }
      },
      beforeUpdate: async (mod) => {
        if (mod.changed("password")) {
          mod.password = await bcrypt.hash(mod.password, 5);
        }
        if (mod.changed("is_blocked") && mod.is_blocked) {
          mod.blocked_at = new Date();
        }
      },
    },
  }
);

Mod.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default Mod;
