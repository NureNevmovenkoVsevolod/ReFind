import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
}

export const createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: "Failed to create user" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedRowsCount, updatedUsers] = await User.update(req.body, {
            where: { user_id: id },
            returning: true,
        });
        if (updatedRowsCount > 0) {
            res.json(updatedUsers[0]);
        } else {
            res.status(404).json({ message: "User not found or no changes made" });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: "Failed to update user" });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRowsCount = await User.destroy({
            where: { user_id: id },
        });
        if (deletedRowsCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
}


