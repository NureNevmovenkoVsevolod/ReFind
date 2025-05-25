import Mod from "../models/mod.model.js";


export const getAllMods = async (req, res) => {
    try {
        const mods = await Mod.findAll();
        res.json(mods);
    } catch (error) {
        console.error("Error fetching moderators:", error);
        res.status(500).json({ message: "Failed to fetch moderators" });
    }
}

export const getModById = async (req, res) => {
    try {
        const { id } = req.params;
        const mod = await Mod.findByPk(id);
        if (mod) {
            res.json(mod);
        } else {
            res.status(404).json({ message: "Moderator not found" });
        }
    } catch (error) {
        console.error("Error fetching moderator by ID:", error);
        res.status(500).json({ message: "Failed to fetch moderator" });
    }
}

export const createMod = async (req, res) => {
    try {
        const { mod_email, mod_password } = req.body;

        const existingMod = await Mod.findOne({ where: { mod_email } });
        if (existingMod) {
            return res.status(400).json({ message: 'Модератор з такою поштою вже існує' });
        }

        const mod = await Mod.create({
            mod_email,
            mod_password
        });

        const { mod_password: _, ...modWithoutPassword } = mod.toJSON();
        res.status(201).json(modWithoutPassword);
    } catch (error) {
        console.error("Error creating moderator:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: "Failed to create moderator" });
    }
}

export const updateMod = async (req, res) => {
    try {
        const { id } = req.params;
        const { mod_email, mod_password } = req.body;

        const mod = await Mod.findByPk(id);
        if (!mod) {
            return res.status(404).json({ message: "Moderator not found" });
        }

        const updateData = {
            mod_email
        };

        if (mod_password) {
            updateData.mod_password = mod_password;
        }

        await mod.update(updateData);

        const { mod_password: _, ...modWithoutPassword } = mod.toJSON();
        res.json(modWithoutPassword);
    } catch (error) {
        console.error("Error updating moderator:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: "Failed to update moderator" });
    }
}

export const deleteMod = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRowsCount = await Mod.destroy({
            where: { mod_id: id },
        });
        if (deletedRowsCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Moderator not found" });
        }
    } catch (error) {
        console.error("Error deleting moderator:", error);
        res.status(500).json({ message: "Failed to delete moderator" });
    }
} 