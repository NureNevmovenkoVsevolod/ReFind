import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Змінюємо з const на export const
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Валідація вхідних даних
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Валідація password
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Генеруємо логін з email (беремо частину до @)
    const login = email.split('@')[0];

    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      login, // Додаємо згенерований логін
      auth_provider: 'local'
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        login: user.login
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};
