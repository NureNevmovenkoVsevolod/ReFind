import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Chat = sequelize.define(
  "Chat",
  {
    chat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id_2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    advertisement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "chat",
    timestamps: true,
  }
);

export default Chat;
