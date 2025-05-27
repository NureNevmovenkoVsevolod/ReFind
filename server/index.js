import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import authRouter from "./routes/auth/index.js";
import indexRouter from "./routes/index.js";
import advertisementRouter from "./routes/advertisement.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import sequelize from "./db.js";
import models from "./models/index.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import verifyToken from "./middlewares/auth.middleware.js";

const CLIENT_LINK = process.env.REACT_APP_CLIENT_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: CLIENT_LINK,
    credentials: true,
  })
);

// Static file serving
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "../client/build")));

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use("/auth", authRouter);
app.use("/api", indexRouter);
app.use("/api/advertisement", advertisementRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payment", paymentRouter);

// Token verification endpoint

app.get("/auth/verify", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
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

export default app;
