import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
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
        const { first_name, last_name, email, password, user_pfp, phone_number, is_blocked, blocked_until } = req.body;

        // Перевірка чи існує користувач з таким email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }

        // Створення нового користувача
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: password,
            user_pfp,
            phone_number,
            is_blocked: is_blocked || false,
            blocked_until,
            auth_provider: 'local'
        });

        // Повертаємо користувача без пароля
        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.status(201).json(userWithoutPassword);
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
        const { first_name, last_name, email, password, user_pfp, phone_number, is_blocked, blocked_until } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Оновлення даних користувача
        const updateData = {
            first_name,
            last_name,
            email,
            user_pfp,
            phone_number,
            is_blocked,
            blocked_until
        };

        await user.update(updateData);

        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.json(userWithoutPassword);
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


