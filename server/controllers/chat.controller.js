import IChatController from '../interfaces/IChatController.js';
import Chat from '../models/chat.model.js';
import Message from '../models/messages.model.js';
import User from '../models/user.model.js';
import { Op, Sequelize } from 'sequelize';

class ChatController extends IChatController {
  async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await Chat.findAll({
        where: {
          [Op.or]: [
            { user_id_1: userId },
            { user_id_2: userId }
          ]
        },
        include: [
          { model: User, as: 'User1', attributes: ['user_id', 'first_name', 'last_name', 'user_pfp'] },
          { model: User, as: 'User2', attributes: ['user_id', 'first_name', 'last_name', 'user_pfp'] },
          {
            model: Message,
            as: 'Messages',
            separate: true,
            limit: 1,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['user_id', 'first_name', 'last_name', 'user_pfp'] }]
          }
        ],
        order: [['updatedAt', 'DESC']]
      });
      res.json(chats);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get chats', error: err.message });
    }
  }

  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { limit = 30, offset = 0 } = req.query;
      const messages = await Message.findAll({
        where: { chat_id: chatId },
        order: [['createdAt', 'ASC']],
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get messages', error: err.message });
    }
  }

  async createChat(req, res) {
    try {
      const { user_id_2, advertisement_id } = req.body;
      const user_id_1 = req.user.id;
      const chat = await Chat.create({ user_id_1, user_id_2, advertisement_id });
      res.status(201).json(chat);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create chat', error: err.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const { chat_id, message_text } = req.body;
      const user_id = req.user.id;
      const message = await Message.create({ chat_id, user_id, message_text });
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
  }

  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const deleted = await Chat.destroy({ where: { chat_id: chatId } });
      if (deleted) {
        return res.status(200).json({ message: 'Chat deleted' });
      }
      return res.status(404).json({ message: 'Chat not found' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

export default new ChatController(); 