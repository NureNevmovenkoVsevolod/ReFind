import Advertisement from "../models/advertisement.model.js";
import Image from "../models/image.model.js";
import Payment from "../models/payments.model.js";
import { Op } from "sequelize";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const {
      title,
      description,
      categorie_id,
      location_description,
      location_coordinates,
      reward,
      type,
      phone,
      email,
      images = [],
    } = req.body;

    // Create advertisement
    const advertisement = await Advertisement.create({
      title,
      description,
      categorie_id,
      user_id: req.user.id,
      location_description,
      location_coordinates: JSON.stringify(location_coordinates),
      reward: reward || 0,
      type,
      status: "active",
      phone,
      email,
      mod_check: false,
    });

    // Save images if any
    if (images.length > 0) {
      await Image.bulkCreate(
        images.map((url) => ({
          advertisement_id: advertisement.advertisement_id,
          url,
        }))
      );
    }

    res.status(201).json(advertisement);
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({ message: "Failed to create advertisement" });
  }
};

// Get all finds
export const getFinds = async (req, res) => {
  try {
    const finds = await Advertisement.findAll({
      where: {
        type: "find",
        mod_check: true,
        status: "active",
      },
      include: [
        {
          model: Image,
          attributes: ["url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(finds);
  } catch (error) {
    console.error("Error fetching finds:", error);
    res.status(500).json({ message: "Failed to fetch finds" });
  }
};

// Get all losses
export const getLosses = async (req, res) => {
  try {
    const losses = await Advertisement.findAll({
      where: {
        type: "lost",
        mod_check: true,
        status: "active",
      },
      include: [
        {
          model: Image,
          attributes: ["url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(losses);
  } catch (error) {
    console.error("Error fetching losses:", error);
    res.status(500).json({ message: "Failed to fetch losses" });
  }
};

// Get advertisement by ID
export const getAdvertisementById = async (req, res) => {
  try {
    const advertisement = await Advertisement.findOne({
      where: { advertisement_id: req.params.id },
      include: [
        {
          model: Image,
          attributes: ["url"],
        },
      ],
    });

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.json(advertisement);
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    res.status(500).json({ message: "Failed to fetch advertisement" });
  }
};

// Get user's advertisements
export const getUserAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Image,
          attributes: ["url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(advertisements);
  } catch (error) {
    console.error("Error fetching user advertisements:", error);
    res.status(500).json({ message: "Failed to fetch user advertisements" });
  }
};

// Update advertisement
export const updateAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findOne({
      where: {
        advertisement_id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!advertisement) {
      return res
        .status(404)
        .json({ message: "Advertisement not found or unauthorized" });
    }

    const {
      title,
      description,
      categorie_id,
      location_description,
      location_coordinates,
      reward,
      phone,
      email,
      images = [],
    } = req.body;

    // Update advertisement details
    await advertisement.update({
      title,
      description,
      categorie_id,
      location_description,
      location_coordinates: JSON.stringify(location_coordinates),
      reward: reward || 0,
      phone,
      email,
    });

    // Update images
    if (images.length > 0) {
      // Delete old images
      await Image.destroy({
        where: { advertisement_id: advertisement.advertisement_id },
      });

      // Add new images
      await Image.bulkCreate(
        images.map((url) => ({
          advertisement_id: advertisement.advertisement_id,
          url,
        }))
      );
    }

    res.json(advertisement);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ message: "Failed to update advertisement" });
  }
};

// Delete advertisement
export const deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findOne({
      where: {
        advertisement_id: req.params.id,
        user_id: req.user.id,
      },
      include: [
        {
          model: Image,
          attributes: ["url"],
        },
      ],
    });

    if (!advertisement) {
      return res
        .status(404)
        .json({ message: "Advertisement not found or unauthorized" });
    }

    // Delete physical image files
    for (const image of advertisement.Images) {
      try {
        const imagePath = path.join(
          process.cwd(),
          "static",
          new URL(image.url).pathname
        );
        await fs.unlink(imagePath);
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }

    // Delete database records
    await Promise.all([
      // Delete images from database
      Image.destroy({
        where: { advertisement_id: advertisement.advertisement_id },
      }),
      // Update related payments as cancelled
      Payment.update(
        { status: "cancelled" },
        { where: { advertisement_id: advertisement.advertisement_id } }
      ),
      // Delete the advertisement
      advertisement.destroy(),
    ]);

    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({ message: "Failed to delete advertisement" });
  }
};
