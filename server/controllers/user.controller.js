import User from "../models/user.model.js";
import Subscription from "../models/subscriptions.model.js";
import Category from "../models/categories.model.js";

// Common error responses
const ERROR_MESSAGES = {
    USER_NOT_FOUND: "User not found",
    USER_EXISTS: "User with this email already exists",
    FETCH_ERROR: "Failed to fetch user(s)",
    CREATE_ERROR: "Failed to create user",
    UPDATE_ERROR: "Failed to update user",
    DELETE_ERROR: "Failed to delete user"
};

class UserController {
    constructor() {
        // Bind all methods to this
        this.handleControllerError = this.handleControllerError.bind(this);
        this.excludePassword = this.excludePassword.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    // Utility methods
    handleControllerError(error, res, customMessage) {
        console.error(`Error: ${customMessage}:`, error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                message: error.errors.map(e => e.message).join(', ') 
            });
        }
        
        res.status(500).json({ message: customMessage });
    }

    excludePassword(user) {
        if (!user) return null;
        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    // Main controller methods
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] }
            });
            res.json(users);
        } catch (error) {
            this.handleControllerError(error, res, ERROR_MESSAGES.FETCH_ERROR);
        }
    }

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            
            if (!user) {
                return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            
            res.json(user);
        } catch (error) {
            this.handleControllerError(error, res, ERROR_MESSAGES.FETCH_ERROR);
        }
    }

    async createUser(req, res) {
        try {
            const { 
                first_name, 
                last_name, 
                email, 
                password, 
                user_pfp, 
                phone_number, 
                is_blocked, 
                blocked_until 
            } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: ERROR_MESSAGES.USER_EXISTS });
            }

            const user = await User.create({
                first_name,
                last_name,
                email,
                password,
                user_pfp,
                phone_number,
                is_blocked: is_blocked || false,
                blocked_until,
                auth_provider: 'local'
            });

            res.status(201).json(this.excludePassword(user));
        } catch (error) {
            this.handleControllerError(error, res, ERROR_MESSAGES.CREATE_ERROR);
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                user_pfp: req.body.user_pfp,
                phone_number: req.body.phone_number,
                is_blocked: req.body.is_blocked,
                blocked_until: req.body.blocked_until
            };

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
            }

            await user.update(updateData);
            res.json(this.excludePassword(user));
        } catch (error) {
            this.handleControllerError(error, res, ERROR_MESSAGES.UPDATE_ERROR);
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const deletedCount = await User.destroy({
                where: { user_id: id }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
            }

            res.status(204).send();
        } catch (error) {
            this.handleControllerError(error, res, ERROR_MESSAGES.DELETE_ERROR);
        }
    }
}

// Add category to favorites (only one per user)
const addFavoriteCategory = async (req, res) => {
  try {
    const { categorie_id } = req.body;
    const user_id = req.user.id;
    if (!categorie_id) return res.status(400).json({ message: "categorie_id is required" });

    // Перевірити, чи вже є така підписка
    const exists = await Subscription.findOne({ where: { user_id, categorie_id } });
    if (exists) {
      return res.status(400).json({ message: "Категорія вже у відслідкованих" });
    }

    await Subscription.create({ user_id, categorie_id });
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove category from favorites (unsubscribe)
const removeFavoriteCategory = async (req, res) => {
  try {
    const { categorie_id } = req.body;
    const user_id = req.user.id;
    if (!categorie_id) return res.status(400).json({ message: "categorie_id is required" });
    const deleted = await Subscription.destroy({ where: { user_id, categorie_id } });
    if (!deleted) return res.status(404).json({ message: "Not in favorites" });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get favorite category for user (only one)
const getFavoriteCategories = async (req, res) => {
  try {
    const user_id = req.user.id;
    const favorites = await Subscription.findAll({
      where: { user_id },
      include: [{ model: Category, attributes: ["categorie_id", "categorie_name"] }],
    });
    const categories = favorites
      .map((sub) => sub.Category)
      .filter(Boolean);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default new UserController();
export { addFavoriteCategory, removeFavoriteCategory, getFavoriteCategories };


