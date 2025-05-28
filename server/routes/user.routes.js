import express from 'express';
import userController, { addFavoriteCategory, removeFavoriteCategory, getFavoriteCategories } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken)

router.post('/favorite-category', addFavoriteCategory);
router.delete('/favorite-category', removeFavoriteCategory);
router.get('/favorite-categories', getFavoriteCategories);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;