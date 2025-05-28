import express from 'express';
import userController from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken)

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/favorite-category', userController.addFavoriteCategory);
router.delete('/favorite-category', userController.removeFavoriteCategory);
router.get('/favorite-categories', userController.getFavoriteCategories);

export default router;