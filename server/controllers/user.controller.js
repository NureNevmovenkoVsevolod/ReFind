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

// Utility function to handle controller errors
const handleControllerError = (error, res, customMessage) => {
    console.error(`Error: ${customMessage}:`, error);
    
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: error.errors.map(e => e.message).join(', ') 
        });
    }
    
    res.status(500).json({ message: customMessage });
};

// Utility function to exclude password from user data
const excludePassword = (user) => {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        handleControllerError(error, res, ERROR_MESSAGES.FETCH_ERROR);
    }
};

export const getUserById = async (req, res) => {
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
        handleControllerError(error, res, ERROR_MESSAGES.FETCH_ERROR);
    }
};

export const createUser = async (req, res) => {
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

        // Check for existing user
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

        res.status(201).json(excludePassword(user));
    } catch (error) {
        handleControllerError(error, res, ERROR_MESSAGES.CREATE_ERROR);
    }
};

export const updateUser = async (req, res) => {
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
        res.json(excludePassword(user));
    } catch (error) {
        handleControllerError(error, res, ERROR_MESSAGES.UPDATE_ERROR);
    }
};

export const deleteUser = async (req, res) => {
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
        handleControllerError(error, res, ERROR_MESSAGES.DELETE_ERROR);
    }
};

// Add category to favorites (only one per user)
export const addFavoriteCategory = async (req, res) => {
  try {
    const { categorie_id } = req.body;
    const user_id = req.user.user_id;
    if (!categorie_id) return res.status(400).json({ message: "categorie_id is required" });
    // Remove all previous subscriptions for this user
    await Subscription.destroy({ where: { user_id } });
    // Add new subscription
    await Subscription.create({ user_id, categorie_id });
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove category from favorites (unsubscribe)
export const removeFavoriteCategory = async (req, res) => {
  try {
    const { categorie_id } = req.body;
    const user_id = req.user.user_id;
    if (!categorie_id) return res.status(400).json({ message: "categorie_id is required" });
    const deleted = await Subscription.destroy({ where: { user_id, categorie_id } });
    if (!deleted) return res.status(404).json({ message: "Not in favorites" });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get favorite category for user (only one)
export const getFavoriteCategories = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const favorite = await Subscription.findOne({
      where: { user_id },
      include: [{ model: Category, attributes: ["categorie_id", "categorie_name"] }],
    });
    res.json(favorite && favorite.Category ? [favorite.Category] : []);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


