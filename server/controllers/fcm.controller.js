// controllers/fcm.controller.js
import User from '../models/user.model.js';

class FCMController {
  async saveToken(req, res) {
    try {
      const { fcm_token } = req.body;
      const userId = req.user.id;

      if (!fcm_token) {
        return res.status(400).json({ message: 'FCM token is required' });
      }

      console.log('Saving FCM token for user:', userId);

      const [updated] = await User.update(
        { fcm_token },
        { 
          where: { user_id: userId },
          returning: true
        }
      );

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('FCM token saved successfully for user:', userId);
      res.json({ message: 'FCM token saved successfully' });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      res.status(500).json({ message: 'Failed to save FCM token' });
    }
  }

  async removeToken(req, res) {
    try {
      const userId = req.user.id;
      console.log('Removing FCM token for user:', userId);

      const [updated] = await User.update(
        { fcm_token: null },
        { 
          where: { user_id: userId },
          returning: true
        }
      );

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('FCM token removed successfully for user:', userId);
      res.json({ message: 'FCM token removed successfully' });
    } catch (error) {
      console.error('Error removing FCM token:', error);
      res.status(500).json({ message: 'Failed to remove FCM token' });
    }
  }
}

export default new FCMController();