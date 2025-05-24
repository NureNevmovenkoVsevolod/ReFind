import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.user_id, 
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      auth_provider: "local",
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: 'user'
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      return res.json({
        token,
        user: {
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        }
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: 'user'
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};
