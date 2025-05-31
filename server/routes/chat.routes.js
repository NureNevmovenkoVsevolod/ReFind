import express from 'express';
import chatController from '../controllers/chat.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log('Chat API called:', req.method, req.originalUrl);
  next();
});

router.get('/', verifyToken, chatController.getUserChats);
router.get('/:chatId/messages', verifyToken, chatController.getChatMessages);
router.post('/', verifyToken, chatController.createChat);
router.post('/message', verifyToken, chatController.sendMessage);

export default router; 