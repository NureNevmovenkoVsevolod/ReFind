import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import authRouter from "./routes/auth/index.js";
import indexRouter from "./routes/index.js";
import sequelize from "./db.js";
import models from "./models/index.js";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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
app.use("/auth", authRouter);
app.use("/api", indexRouter);

// Token verification endpoint
app.get("/auth/verify", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

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
    console.error("❌ Помилка з’єднання:", error);
  }
};

startServer();
