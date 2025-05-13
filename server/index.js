import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import authRouter from "./routes/auth/index.js";
import sequelize from "./db.js";
import models from "./models/index.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Routes
////Auth
app.use("/auth", authRouter);

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
