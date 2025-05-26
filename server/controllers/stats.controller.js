import User from "../models/user.model.js";
import Advertisement from "../models/advertisement.model.js";
import Complaint from "../models/complaints.model.js";
import Category from "../models/categories.model.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../db.js";


export const getCountUsers = async (req, res) => {
    try {
        const countUsers = await User.count();
        res.json({ count: countUsers });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountUsers" });
    }
};

export const getCountAllAds = async (req, res) => {
    try {
        const count = await Advertisement.count();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountAllAds" });
    }
};

export const getCountPendingAds = async (req, res) => {
    try {
        const count = await Advertisement.count({ 
            where: {         
            mod_check: false,
            status: "active", 
        }});
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountPendingAds" });
    }
};

export const getCountActiveComplaints = async (req, res) => {
    try {
        const count = await Complaint.count({ where: { complaint_status: 'active' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountActiveComplaints" });
    }
};

export const getCountLostAds = async (req, res) => {
    try {
        const count = await Advertisement.count({ where: { type: 'lost' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountLostAds" });
    }
};

export const getCountFoundAds = async (req, res) => {
    try {
        const count = await Advertisement.count({ where: { type: 'find' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Failed to getCountFoundAds" });
    }
};

export const getAdsGraphData = async (req, res) => {
    try {
        const { period = 'week', type = 'all' } = req.query;
        
        // Визначаємо інтервал дат залежно від періоду
        const now = new Date();
        let startDate;
        let dateFormat;
        
        switch (period) {
            case 'day':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                dateFormat = 'HH24:00';
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                dateFormat = 'YYYY-MM-DD';
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                dateFormat = 'YYYY-MM-DD';
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                dateFormat = 'YYYY-MM';
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                dateFormat = 'YYYY-MM-DD';
        }
        
        // Базовий запит
        let whereCondition = {
            createdAt: {
                [Op.gte]: startDate
            }
        };
        
        // Додаємо фільтр за типом
        if (type !== 'all') {
            whereCondition.type = type === 'lost' ? 'lost' : 'find';
        }
        
        // Запит для отримання даних з групуванням за періодом
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
        
        // Форматуємо дані для графіка
        const formattedData = graphData.map(item => {
            const baseData = {
                period: item.period,
                total: parseInt(item.count) || 0
            };

            if (type === 'all') {
                return {
                    ...baseData,
                    lost: parseInt(item.lostCount || 0),
                    found: parseInt(item.foundCount || 0)
                };
            }

            return baseData;
        });

        console.log('Formatted data:', formattedData);

        res.json({
            data: formattedData,
            period,
            type
        });
    } catch (error) {
        console.error("Error fetching ads graph data:", error);
        res.status(500).json({ 
            message: "Failed to get ads graph data",
            error: error.message 
        });
    }
};

export const getCategoriesStats = async (req, res) => {
    try {
        // Отримуємо статистику за категоріями з використанням зв'язків моделей
        const categoriesStats = await Advertisement.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('advertisement_id')), 'count']
            ],
            include: [{
                model: Category,
                attributes: ['categorie_name'],
                required: true
            }],
            where: {
                status: 'active',
                mod_check: true
            },
            group: ['Category.categorie_id', 'Category.categorie_name'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('advertisement_id')), 'DESC']],
            raw: true
        });

        // Форматуємо дані для відповіді
        const formattedData = categoriesStats.map(item => ({
            category: item['Category.categorie_name'] || 'Без категорії',
            count: parseInt(item.count) || 0
        }));

        console.log('Categories stats:', formattedData);

        res.json({
            data: formattedData
        });
    } catch (error) {
        console.error("Error fetching categories stats:", error);
        res.status(500).json({ 
            message: "Помилка при отриманні статистики за категоріями",
            error: error.message 
        });
    }
};