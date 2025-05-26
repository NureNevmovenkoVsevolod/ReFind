import User from "../models/user.model.js";

const checkBlocked = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    if (user.is_blocked) {
      const now = new Date();

      if (!user.blocked_until) {
        return res.status(403).json({ 
          message: "Ваш акаунт заблоковано на невизначений термін"
        });
      }

      const blockedUntil = new Date(user.blocked_until);

      if (now > blockedUntil) {
        await user.update({
          is_blocked: false,
          blocked_until: null,
          blocked_at: null
        });
      } else {
        
        const timeUntilUnblock = blockedUntil - now;
        const hours = Math.floor(timeUntilUnblock / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilUnblock % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(403).json({ 
          message: "Ваш акаунт заблоковано",
          blocked_until: user.blocked_until,
          time_remaining: {
            hours,
            minutes,
            formatted: hours > 0 
              ? `${hours} годин ${minutes} хвилин`
              : `${minutes} хвилин`
          }
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