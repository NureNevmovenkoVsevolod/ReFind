import User from "../models/user.model.js";

const checkBlocked = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    if (user.is_blocked && user.blocked_until) {
      const now = new Date();
      const blockedUntil = new Date(user.blocked_until);

      if (now > blockedUntil) {
        await user.update({
          is_blocked: false,
          blocked_until: null,
          blocked_at: null
        });
      } else {
        return res.status(403).json({ 
          message: "Ваш акаунт заблоковано",
          blocked_until: user.blocked_until
        });
      }
    }
    next();
  } catch (error) {
    console.error("Помилка при перевірці блокування:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export default checkBlocked; 