import express from 'express';
import fcmController from '../controllers/fcm.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/token', fcmController.saveToken);
router.delete('/token', fcmController.removeToken);

export default router;