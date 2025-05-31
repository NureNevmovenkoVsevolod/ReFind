import User from "../models/user.model.js";
import Advertisement from "../models/advertisement.model.js";
import Complaint from "../models/complaints.model.js";
import Category from "../models/categories.model.js";
import { Op, Sequelize } from "sequelize";

class StatsController {
    async getCountUsers(req, res) {
        try {
            res.json({ count: await User.count() });
        } catch {
            res.status(500).json({ message: "Failed to getCountUsers" });
        }
    }
    async getCountAllAds(req, res) {
        try {
            res.json({ count: await Advertisement.count({ where: { status: 'active', mod_check: true } }) });
        } catch {
            res.status(500).json({ message: "Failed to getCountAllAds" });
        }
    }
    async getCountPendingAds(req, res) {
        try {
            res.json({ count: await Advertisement.count({ where: { mod_check: false, status: "active" } }) });
        } catch {
            res.status(500).json({ message: "Failed to getCountPendingAds" });
        }
    }
    async getCountActiveComplaints(req, res) {
        try {
            res.json({ count: await Complaint.count({ where: { complaint_status: 'pending' } }) });
        } catch {
            res.status(500).json({ message: "Failed to getCountActiveComplaints" });
        }
    }
    async getCountLostAds(req, res) {
        try {
            res.json({ count: await Advertisement.count({ where: { type: 'lost' } }) });
        } catch {
            res.status(500).json({ message: "Failed to getCountLostAds" });
        }
    }
    async getCountFoundAds(req, res) {
        try {
            res.json({ count: await Advertisement.count({ where: { type: 'find' } }) });
        } catch {
            res.status(500).json({ message: "Failed to getCountFoundAds" });
        }
    }
    async getAdsGraphData(req, res) {
        try {
            const { period = 'week', type = 'all' } = req.query;
            const now = new Date();
            let startDate, dateFormat;
            switch (period) {
                case 'day': startDate = new Date(now); startDate.setHours(0, 0, 0, 0); dateFormat = 'HH24:00'; break;
                case 'week': startDate = new Date(now); startDate.setDate(now.getDate() - 7); dateFormat = 'YYYY-MM-DD'; break;
                case 'month': startDate = new Date(now); startDate.setDate(now.getDate() - 30); dateFormat = 'YYYY-MM-DD'; break;
                case 'year': startDate = new Date(now); startDate.setFullYear(now.getFullYear() - 1); dateFormat = 'YYYY-MM'; break;
                default: startDate = new Date(now); startDate.setDate(now.getDate() - 7); dateFormat = 'YYYY-MM-DD';
            }
            let whereCondition = { createdAt: { [Op.gte]: startDate } };
            if (type !== 'all') whereCondition.type = type === 'lost' ? 'lost' : 'find';
            const graphData = await Advertisement.findAll({
                attributes: [
                    [Sequelize.fn('to_char', Sequelize.col('createdAt'), dateFormat), 'period'],
                    [Sequelize.fn('COUNT', Sequelize.col('advertisement_id')), 'count'],
                    ...(type === 'all' ? [
                        [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN type = 'lost' THEN 1 END")), 'lostCount'],
                        [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN type = 'find' THEN 1 END")), 'foundCount']
                    ] : [])
                ],
                where: whereCondition,
                group: [Sequelize.fn('to_char', Sequelize.col('createdAt'), dateFormat)],
                order: [[Sequelize.fn('to_char', Sequelize.col('createdAt'), dateFormat), 'ASC']],
                raw: true
            });
            const formattedData = graphData.map(item => {
                const baseData = { period: item.period, total: parseInt(item.count) || 0 };
                if (type === 'all') {
                    return { ...baseData, lost: parseInt(item.lostCount || 0), found: parseInt(item.foundCount || 0) };
                }
                return baseData;
            });
            res.json({ data: formattedData, period, type });
        } catch (error) {
            console.error("Error fetching ads graph data:", error);
            res.status(500).json({ message: "Failed to get ads graph data", error: error.message });
        }
    }
    async getCategoriesStats(req, res) {
        try {
            const categoriesStats = await Advertisement.findAll({
                attributes: [[Sequelize.fn('COUNT', Sequelize.col('advertisement_id')), 'count']],
                include: [{ model: Category, attributes: ['categorie_name'], required: true }],
                where: { status: 'active', mod_check: true },
                group: ['Category.categorie_id', 'Category.categorie_name'],
                order: [[Sequelize.fn('COUNT', Sequelize.col('advertisement_id')), 'DESC']],
                raw: true
            });
            res.json({
                data: categoriesStats.map(item => ({
                    category: item['Category.categorie_name'] || 'Без категорії',
                    count: parseInt(item.count) || 0
                }))
            });
        } catch (error) {
            console.error("Error fetching categories stats:", error);
            res.status(500).json({ message: "Помилка при отриманні статистики за категоріями", error: error.message });
        }
    }
}

export default new StatsController();