import Advertisement from "../models/advertisement.model.js";
import Image from "../models/image.model.js";
import Payment from "../models/payments.model.js";
import Category from "../models/categories.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import IAdvertisementController from "../interfaces/IAdvertisementController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// палка не стріляє мінімум 364 дні

const mapAdWithCategory = (row) => {
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
};

const buildQueryOptions = ({ type, category, limit, offset }) => ({
  where: { type, status: "active", mod_check: true },
  include: [
    { model: Image, attributes: ["image_url"] },
    {
      model: Category,
      attributes: ["categorie_id", "categorie_name"],
      ...(category && { where: { categorie_name: category } }),
    },
  ],
  order: [["createdAt", "DESC"]],
  limit,
  offset,
  distinct: true,
});

class AdvertisementController extends IAdvertisementController {
  constructor() {
    super();
    this.getFinds = this.getFinds.bind(this);
    this.getLosses = this.getLosses.bind(this);
    this.getAdsByType = this.getAdsByType.bind(this);
    this.createAdvertisement = this.createAdvertisement.bind(this);
    this.getAllAds = this.getAllAds.bind(this);
    this.getAdvertisementById = this.getAdvertisementById.bind(this);
    this.getUserAdvertisements = this.getUserAdvertisements.bind(this);
    this.updateAdvertisement = this.updateAdvertisement.bind(this);
    this.deleteAdvertisement = this.deleteAdvertisement.bind(this);
    this.addImagesToAdvertisement = this.addImagesToAdvertisement.bind(this);
    this.getAdvertisementsForModeration =
      this.getAdvertisementsForModeration.bind(this);
    this.moderateAdvertisement = this.moderateAdvertisement.bind(this);
  }

  async createAdvertisement(req, res) {
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
      if (req.files?.length) {
        await Promise.all(
          req.files.map(async (file) => {
            try {
              const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { folder: "advertisements" },
                  (error, result) => (error ? reject(error) : resolve(result))
                );
                stream.end(file.buffer);
              });
              await Image.create({
                advertisement_id: advertisement.advertisement_id,
                image_url: result.secure_url,
              });
            } catch (error) {
              console.error("Error creating image record:", error);
            }
          })
        );
      }
      const completeAd = await Advertisement.findOne({
        where: { advertisement_id: advertisement.advertisement_id },
        include: [{ model: Image, attributes: ["image_url"] }],
      });
      res.status(201).json(completeAd);
    } catch (error) {
      console.error("Error creating advertisement:", error);
      res
        .status(500)
        .json({
          message: "Failed to create advertisement",
          error: error.message,
        });
    }
  }

  async getAllAds(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const offset = (page - 1) * limit;
      const category = req.query.category;
      const search = req.query.search;

      const whereClause = {
        status: "active",
        mod_check: true,
      };

      if (category) {
        whereClause.categorie_id = category;
      }

      if (search) {
        whereClause[Op.or] = [
          {
            title: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            description: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            location_description: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      const { count, rows } = await Advertisement.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [
          { model: Image, attributes: ["image_url"] },
          { model: Category, attributes: ["categorie_id", "categorie_name"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      const items = rows.map(mapAdWithCategory);

      res.json({
        items,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count,
      });
    } catch (error) {
      console.error("Error fetching all advertisements:", error);
      res.status(500).json({ message: "Failed to fetch all advertisements" });
    }
  }

  async getFinds(req, res) {
    await this.getAdsByType("find", req, res);
  }

  async getLosses(req, res) {
    await this.getAdsByType("lost", req, res);
  }

  async getAdsByType(type, req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const offset = (page - 1) * limit;
      const category = req.query.category;
      const { count, rows } = await Advertisement.findAndCountAll(
        buildQueryOptions({ type, category, limit, offset })
      );
      res.json({
        items: rows.map(mapAdWithCategory),
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count,
      });
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      res.status(500).json({ message: `Failed to fetch ${type}s` });
    }
  }

  async getAdvertisementById(req, res) {
    try {
      const ad = await Advertisement.findOne({
        where: { advertisement_id: req.params.id },
        include: [
          { model: Image, attributes: ["image_url"] },
          { model: User, attributes: ["first_name", "user_pfp"] },
          { model: Category, attributes: ["categorie_id", "categorie_name"] },
        ],
      });
      if (!ad)
        return res.status(404).json({ message: "Advertisement not found" });
      res.json({
        ...ad.toJSON(),
        categorie_id: ad.categorie_id,
        categorie_name: ad.Category?.categorie_name,
        location_coordinates: JSON.parse(ad.location_coordinates),
      });
    } catch (error) {
      console.error("Error fetching advertisement:", error);
      res.status(500).json({ message: "Failed to fetch advertisement" });
    }
  }

  async getUserAdvertisements(req, res) {
    try {
      const ads = await Advertisement.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: Image, attributes: ["image_url"] },
          { model: Category, attributes: ["categorie_name"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.json(ads);
    } catch (error) {
      console.error("Error fetching user advertisements:", error);
      res.status(500).json({ message: "Failed to fetch user advertisements" });
    }
  }

  async updateAdvertisement(req, res) {
    try {
      const ad = await Advertisement.findOne({
        where: { advertisement_id: req.params.id, user_id: req.user.id },
      });
      if (!ad)
        return res
          .status(404)
          .json({ message: "Advertisement not found or unauthorized" });
      if (ad.mod_check === false)
        return res
          .status(403)
          .json({
            message:
              "Оголошення знаходиться на модерації і не може бути відредаговане.",
          });
      const {
        title,
        description,
        categorie_id,
        location_description,
        location_coordinates,
        reward,
        phone,
        email,
      } = req.body;
      await ad.update({
        title,
        description,
        categorie_id,
        location_description,
        location_coordinates: JSON.stringify(location_coordinates),
        reward: reward || 0,
        phone,
        email,
        mod_check: false,
      });
      let newImageUrls = [];
      if (req.body.existingImages)
        newImageUrls = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      if (req.files?.length) {
        for (const file of req.files) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "advertisements" },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(file.buffer);
          });
          newImageUrls.push(result.secure_url);
        }
      }
      if (newImageUrls.length > 0) {
        await Image.destroy({
          where: { advertisement_id: ad.advertisement_id },
        });
        await Image.bulkCreate(
          newImageUrls.map((url) => ({
            advertisement_id: ad.advertisement_id,
            image_url: url,
          }))
        );
      }
      const updatedAd = await Advertisement.findOne({
        where: { advertisement_id: ad.advertisement_id },
        include: [
          { model: Image, attributes: ["image_url"] },
          { model: Category, attributes: ["categorie_id", "categorie_name"] },
        ],
      });
      res.json({
        ...updatedAd.toJSON(),
        categorie_id: updatedAd.categorie_id,
        categorie_name: updatedAd.Category?.categorie_name,
        location_coordinates: JSON.parse(updatedAd.location_coordinates),
      });
    } catch (error) {
      console.error("Error updating advertisement:", error);
      res.status(500).json({ message: "Failed to update advertisement" });
    }
  }

  async deleteAdvertisement(req, res) {
    try {
      const ad = await Advertisement.findOne({
        where: { advertisement_id: req.params.id, user_id: req.user.id },
        include: [{ model: Image, attributes: ["image_url"] }],
      });
      if (!ad)
        return res
          .status(404)
          .json({ message: "Advertisement not found or unauthorized" });
      for (const image of ad.Images) {
        try {
          const imagePath = path.join(
            process.cwd(),
            "static",
            new URL(image.image_url).pathname
          );
          await fs.unlink(imagePath);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }
      await Promise.all([
        Image.destroy({ where: { advertisement_id: ad.advertisement_id } }),
        Payment.update(
          { status: "cancelled" },
          { where: { advertisement_id: ad.advertisement_id } }
        ),
        ad.destroy(),
      ]);
      res.json({ message: "Advertisement deleted successfully" });
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      res.status(500).json({ message: "Failed to delete advertisement" });
    }
  }

  async addImagesToAdvertisement(req, res) {
    try {
      const { advertisement_id } = req.params;
      const ad = await Advertisement.findOne({
        where: { advertisement_id, user_id: req.user.id },
      });
      if (!ad)
        return res
          .status(404)
          .json({ message: "Advertisement not found or unauthorized" });
      if (req.files?.length) {
        await Promise.all(
          req.files.map(async (file) => {
            const result = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "advertisements" },
                (error, result) => (error ? reject(error) : resolve(result))
              );
              stream.end(file.buffer);
            });
            await Image.create({
              advertisement_id: ad.advertisement_id,
              image_url: result.secure_url,
            });
          })
        );
        const updatedAd = await Advertisement.findOne({
          where: { advertisement_id },
          include: [{ model: Image, attributes: ["image_url"] }],
        });
        return res.json(updatedAd);
      }
      res.status(400).json({ message: "No images provided" });
    } catch (error) {
      console.error("Error adding images:", error);
      res.status(500).json({ message: "Failed to add images" });
    }
  }

  async getAdvertisementsForModeration(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const offset = (page - 1) * limit;
      const queryOptions = {
        where: { mod_check: false, status: "active" },
        include: [
          { model: Image, attributes: ["image_url"] },
          { model: Category, attributes: ["categorie_id", "categorie_name"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true,
      };
      const { count, rows } = await Advertisement.findAndCountAll(queryOptions);
      res.json({
        items: rows.map(mapAdWithCategory),
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count,
      });
    } catch (error) {
      console.error("Error fetching advertisements for moderation:", error);
      res
        .status(500)
        .json({
          message: "Failed to fetch advertisements for moderation",
          error: error.message,
        });
    }
  }

  async moderateAdvertisement(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const advertisement = await Advertisement.findOne({
        where: { advertisement_id: id },
      });
      if (!advertisement)
        return res.status(404).json({ message: "Оголошення не знайдено" });
      if (approved) {
        await advertisement.update({ mod_check: true });
        res.json({ message: "Оголошення схвалено" });
      } else {
        await advertisement.update({ status: "rejected" });
        res.json({ message: "Оголошення відхилено" });
      }
    } catch (error) {
      console.error("Помилка при модерації оголошення:", error);
      res.status(500).json({ message: "Помилка при модерації оголошення" });
    }
  }
}

export default new AdvertisementController();
