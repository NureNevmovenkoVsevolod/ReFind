import Review from '../models/reviews.model.js';
import User from '../models/user.model.js';

const reviewController = {
  // Створити відгук
  async createReview(req, res) {
    try {
      const { review_text, review_rating, user_reviewer_id, user_reviewed_id } = req.body;
      if (!review_rating || !user_reviewer_id || !user_reviewed_id) {
        return res.status(400).json({ message: 'Всі поля обовʼязкові' });
      }
      const review = await Review.create({
        review_text: review_text || '',
        review_rating,
        user_reviewer_id,
        user_reviewed_id,
        review_date: new Date(),
      });
      res.status(201).json(review);
    } catch (e) {
      res.status(500).json({ message: 'Не вдалося створити відгук', error: e.message });
    }
  },

  // Отримати всі відгуки для користувача
  async getUserReviews(req, res) {
    try {
      const { userId } = req.params;
      const reviews = await Review.findAll({
        where: { user_reviewed_id: userId },
        include: [{ model: User, as: 'Reviewer', attributes: ['user_id', 'first_name', 'last_name', 'user_pfp'] }],
        order: [['review_date', 'DESC']]
      });
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ message: 'Не вдалося отримати відгуки', error: e.message });
    }
  },
};

export default reviewController; 