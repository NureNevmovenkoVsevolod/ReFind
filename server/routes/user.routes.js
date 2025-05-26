import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, addFavoriteCategory, removeFavoriteCategory, getFavoriteCategories } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';


const router = express.Router();

router.use(verifyToken)

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/favorite-category', addFavoriteCategory);
router.delete('/favorite-category', removeFavoriteCategory);
router.get('/favorite-categories', getFavoriteCategories);

export default router;