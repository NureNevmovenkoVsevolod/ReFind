import Complaint from '../models/complaints.model.js';
import User from '../models/user.model.js';
import Advertisement from '../models/advertisement.model.js';
import Category from '../models/categories.model.js';
import Image from '../models/image.model.js';

class ComplaintController {
    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.rejectComplaint = this.rejectComplaint.bind(this);
        this.deleteAdvertisement = this.deleteAdvertisement.bind(this);
    }

    async create(req, res) {
        try {
            const { advertisement_id, complaints_text, title } = req.body;
            const user_id = req.user.id;

            // Перевірка чи існує оголошення
            const advertisement = await Advertisement.findByPk(advertisement_id);
            if (!advertisement) {
                return res.status(404).json({ message: "Оголошення не знайдено" });
            }

            const complaint = await Complaint.create({
                user_id,
                advertisement_id,
                complaints_text,
                title,
                complaint_status: "pending"
            });

            res.status(201).json({
                message: "Скаргу успішно створено",
                complaint
            });
        } catch (error) {
            console.error("Помилка при створенні скарги:", error);
            res.status(500).json({ message: "Помилка при створенні скарги" });
        }
    }

    async getAll(req, res) {
        try {
            const complaints = await Complaint.findAll({
                where: {
                    complaint_status: 'pending'
                },
                include: [
                    {
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name', 'user_pfp']
                    },
                    {
                        model: Advertisement,
                        attributes: [
                            'advertisement_id',
                            'title',
                            'description',
                            'categorie_id',
                            'type',
                            'location_description',
                            'location_coordinates',
                            'reward',
                            'status',
                            'phone',
                            'email',
                            'incident_date',
                            'createdAt'
                        ],
                        include: [
                            {
                                model: Image,
                                attributes: ['image_url']
                            },
                            {
                                model: Category,
                                attributes: ['categorie_id', 'categorie_name']
                            }
                        ]
                    }
                ],
                order: [['complaint_date', 'DESC']]
            });

            // Форматуємо дані для відображення в картках
            const formattedComplaints = complaints.map(complaint => ({
                id: complaint.complaint_id,
                user: {
                    id: complaint.User.user_id,
                    name: `${complaint.User.first_name} ${complaint.User.last_name}`,
                    avatar: complaint.User.user_pfp
                },
                advertisement: {
                    id: complaint.Advertisement.advertisement_id,
                    title: complaint.Advertisement.title,
                    description: complaint.Advertisement.description,
                    type: complaint.Advertisement.type,
                    location_description: complaint.Advertisement.location_description,
                    location_coordinates: JSON.parse(complaint.Advertisement.location_coordinates),
                    reward: complaint.Advertisement.reward,
                    status: complaint.Advertisement.status,
                    phone: complaint.Advertisement.phone,
                    email: complaint.Advertisement.email,
                    incident_date: complaint.Advertisement.incident_date,
                    created_at: complaint.Advertisement.createdAt,
                    images: complaint.Advertisement.Images.map(img => img.image_url),
                    category: {
                        id: complaint.Advertisement.Category.categorie_id,
                        name: complaint.Advertisement.Category.categorie_name
                    }
                },
                text: complaint.complaints_text,
                date: complaint.complaint_date,
                status: complaint.complaint_status
            }));

            res.json(formattedComplaints);
        } catch (error) {
            console.error("Помилка при отриманні скарг:", error);
            res.status(500).json({ message: "Помилка при отриманні скарг" });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const complaint = await Complaint.findByPk(id, {
                include: [
                    {
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name', 'user_pfp', 'email']
                    },
                    {
                        model: Advertisement,
                        attributes: [
                            'advertisement_id',
                            'title',
                            'description',
                            'categorie_id',
                            'type',
                            'location_description',
                            'location_coordinates',
                            'reward',
                            'status',
                            'phone',
                            'email',
                            'incident_date',
                            'createdAt'
                        ],
                        include: [
                            {
                                model: Image,
                                attributes: ['image_url']
                            },
                            {
                                model: Category,
                                attributes: ['categorie_id', 'categorie_name']
                            }
                        ]
                    }
                ]
            });

            if (!complaint) {
                return res.status(404).json({ message: "Скаргу не знайдено" });
            }

            // Форматуємо дані для модального вікна
            const formattedComplaint = {
                id: complaint.complaint_id,
                user: {
                    id: complaint.User.user_id,
                    name: `${complaint.User.first_name} ${complaint.User.last_name}`,
                    avatar: complaint.User.user_pfp,
                    email: complaint.User.email
                },
                advertisement: {
                    id: complaint.Advertisement.advertisement_id,
                    title: complaint.Advertisement.title,
                    description: complaint.Advertisement.description,
                    type: complaint.Advertisement.type,
                    location_description: complaint.Advertisement.location_description,
                    location_coordinates: JSON.parse(complaint.Advertisement.location_coordinates),
                    reward: complaint.Advertisement.reward,
                    status: complaint.Advertisement.status,
                    phone: complaint.Advertisement.phone,
                    email: complaint.Advertisement.email,
                    incident_date: complaint.Advertisement.incident_date,
                    created_at: complaint.Advertisement.createdAt,
                    images: complaint.Advertisement.Images.map(img => img.image_url),
                    category: {
                        id: complaint.Advertisement.Category.categorie_id,
                        name: complaint.Advertisement.Category.categorie_name
                    }
                },
                text: complaint.complaints_text,
                date: complaint.complaint_date,
                status: complaint.complaint_status
            };

            res.json(formattedComplaint);
        } catch (error) {
            console.error("Помилка при отриманні скарги:", error);
            res.status(500).json({ message: "Помилка при отриманні скарги" });
        }
    }

    async rejectComplaint(req, res) {
        try {
            const { id } = req.params;
            const complaint = await Complaint.findByPk(id);

            if (!complaint) {
                return res.status(404).json({ message: "Скаргу не знайдено" });
            }

            await complaint.update({ 
                complaint_status: 'rejected'
            });

            res.json({ 
                message: "Скаргу відхилено",
                complaint: {
                    id: complaint.complaint_id,
                    status: complaint.complaint_status
                }
            });
        } catch (error) {
            console.error("Помилка при відхиленні скарги:", error);
            res.status(500).json({ message: "Помилка при відхиленні скарги" });
        }
    }

    async deleteAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const complaint = await Complaint.findByPk(id, {
                include: [{
                    model: Advertisement
                }]
            });

            if (!complaint) {
                return res.status(404).json({ message: "Скаргу не знайдено" });
            }

            // Видаляємо оголошення
            await complaint.Advertisement.destroy();
            
            // Оновлюємо статус скарги
            await complaint.update({ 
                complaint_status: 'resolved'
            });

            res.json({ 
                message: "Оголошення видалено",
                complaint: {
                    id: complaint.complaint_id,
                    status: complaint.complaint_status
                }
            });
        } catch (error) {
            console.error("Помилка при видаленні оголошення:", error);
            res.status(500).json({ message: "Помилка при видаленні оголошення" });
        }
    }
}

export default new ComplaintController();