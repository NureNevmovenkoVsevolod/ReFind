import Category from "../models/categories.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["categorie_id", "categorie_name"],
      order: [["categorie_name", "ASC"]],
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
