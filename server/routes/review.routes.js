import express from 'express';
import reviewController from '../controllers/review.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

// Створити відгук
router.post('/', verifyToken, reviewController.createReview);
// Отримати всі відгуки для користувача
router.get('/user/:userId', reviewController.getUserReviews);
// Перевірити чи існує відгук
router.get('/check', verifyToken, reviewController.checkExistingReview);

export default router; 