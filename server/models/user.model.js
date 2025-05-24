import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_pfp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    blocked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    blocked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    auth_provider: {
      type: DataTypes.ENUM("local", "google", "facebook"),
      defaultValue: "local",
    },
    provider_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 5);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 5);
        }
        if (user.changed("is_blocked") && user.is_blocked) {
          user.blocked_at = new Date();
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
