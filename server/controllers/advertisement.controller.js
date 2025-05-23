import Advertisement from "../models/advertisement.model.js";
import Image from "../models/image.model.js";
import Payment from "../models/payments.model.js";
import Category from "../models/categories.model.js";
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
      incident_date,
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
      incident_date,
    });

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file) => {
        try {
          const imageUrl = `/uploads/${file.filename}`;

          const image = await Image.create({
            advertisement_id: advertisement.advertisement_id,
            image_url: imageUrl,
          });

          return image;
        } catch (error) {
          console.error("Error creating image record:", error);
        }
      });

      await Promise.all(imagePromises);
    }

    const completeAdvertisement = await Advertisement.findOne({
      where: { advertisement_id: advertisement.advertisement_id },
      include: [
        {
          model: Image,
          attributes: ["image_url"],
        },
      ],
    });

    res.status(201).json(completeAdvertisement);
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({
      message: "Failed to create advertisement",
      error: error.message,
    });
  }
};

// Get all finds
export const getFinds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    const queryOptions = {
      where: {
        type: "find",
        status: "active",
        mod_check: true,
      },
      include: [
        {
          model: Image,
          attributes: ["image_url"],
        },
        {
          model: Category,
          attributes: ["categorie_id", "categorie_name"],
          ...(category && {
            where: { categorie_name: category },
          }),
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    };

    const { count, rows } = await Advertisement.findAndCountAll(queryOptions);

    // Universal response for both main and board pages
    const items = rows.map((row) => {
      const ad = row.toJSON();
      return {
        advertisement_id: ad.advertisement_id,
        title: ad.title,
        description: ad.description,
        categorie_id: ad.categorie_id,
        categorie_name: ad.Category?.categorie_name,
        location_description: ad.location_description,
        location_coordinates: ad.location_coordinates,
        reward: ad.reward,
        type: ad.type,
        status: ad.status,
        phone: ad.phone,
        email: ad.email,
        incident_date: ad.incident_date,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        Images: ad.Images || [],
      };
    });

    res.json({
      items,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      hasMore: offset + rows.length < count,
    });
  } catch (error) {
    console.error("Error fetching finds:", error);
    res.status(500).json({ message: "Failed to fetch finds" });
  }
};

// Get all losses
export const getLosses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    const queryOptions = {
      where: {
        type: "lost",
        status: "active",
        mod_check: true,
      },
      include: [
        {
          model: Image,
          attributes: ["image_url"],
        },
        {
          model: Category,
          attributes: ["categorie_id", "categorie_name"],
          ...(category && {
            where: { categorie_name: category },
          }),
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    };

    const { count, rows } = await Advertisement.findAndCountAll(queryOptions);

    // Universal response for both main and board pages
    const items = rows.map((row) => {
      const ad = row.toJSON();
      return {
        advertisement_id: ad.advertisement_id,
        title: ad.title,
        description: ad.description,
        categorie_id: ad.categorie_id,
        categorie_name: ad.Category?.categorie_name,
        location_description: ad.location_description,
        location_coordinates: ad.location_coordinates,
        reward: ad.reward,
        type: ad.type,
        status: ad.status,
        phone: ad.phone,
        email: ad.email,
        incident_date: ad.incident_date,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        Images: ad.Images || [],
      };
    });

    res.json({
      items,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      hasMore: offset + rows.length < count,
    });
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
          attributes: ["image_url"],
        },
      ],
    });

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.json({...advertisement.toJSON(),
      location_coordinates: JSON.parse(advertisement.location_coordinates)});
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
          attributes: ["image_url"],
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

// Add images to advertisement
export const addImagesToAdvertisement = async (req, res) => {
  try {
    const { advertisement_id } = req.params;

    // Check if advertisement exists and belongs to user
    const advertisement = await Advertisement.findOne({
      where: {
        advertisement_id,
        user_id: req.user.id,
      },
    });

    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found or unauthorized",
      });
    }

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file) => {
        // Generate the URL for the uploaded image
        const imageUrl = `/uploads/${file.filename}`;

        // Create image record in database
        return Image.create({
          advertisement_id: advertisement.advertisement_id,
          image_url: imageUrl,
        });
      });

      await Promise.all(imagePromises);

      // Get updated advertisement with images
      const updatedAdvertisement = await Advertisement.findOne({
        where: { advertisement_id },
        include: [
          {
            model: Image,
            attributes: ["image_url"],
          },
        ],
      });

      return res.json(updatedAdvertisement);
    }

    return res.status(400).json({ message: "No images provided" });
  } catch (error) {
    console.error("Error adding images to advertisement:", error);
    res.status(500).json({ message: "Failed to add images" });
  }
};
