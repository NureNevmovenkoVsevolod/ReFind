import express from "express";
import router from "./routes/index.js";
import sequelize from "./db.js";
import models from "./models/index.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/", router);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ З’єднання з Railway встановлено!");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("❌ Помилка з’єднання:", err);
  }
};

startServer();
