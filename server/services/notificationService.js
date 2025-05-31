// services/notificationService.js
import admin from '../config/firebase.js';
import User from '../models/user.model.js';
import Subscription from '../models/subscriptions.model.js';
import { Op } from 'sequelize';

class NotificationService {
  async sendNewAdvertisementNotification(advertisement) {
    try {
      console.log('Sending notification for advertisement:', advertisement.advertisement_id);
      console.log('Advertisement category:', advertisement.categorie_id);
      
      // Спочатку перевіримо всі підписки на цю категорію
      const allSubscriptions = await Subscription.findAll({
        where: { categorie_id: advertisement.categorie_id },
        raw: true
      });
      
      console.log('All subscriptions for category:', allSubscriptions);

      // Знайти користувачів, підписаних на цю категорію
      const subscriptions = await Subscription.findAll({
        where: { categorie_id: advertisement.categorie_id },
        include: [{
          model: User,
          attributes: ['user_id', 'fcm_token'],
          where: {
            fcm_token: { [Op.ne]: null },
            user_id: { [Op.ne]: advertisement.user_id }
          }
        }],
      });


      if (subscriptions.length === 0) {
        console.log('No subscribers found for category:', advertisement.categorie_id);
        return;
      }

      const tokens = subscriptions
        .map(sub => sub.User?.fcm_token)
        .filter(token => token);

      if (tokens.length === 0) {
        console.log('No valid FCM tokens found');
        return;
      }

      const message = {
        notification: {
          title: `Нове оголошення: ${advertisement.type === 'lost' ? 'Загублено' : 'Знайдено'}`,
          body: advertisement.title
        },
        android: {
          notification: {
            icon: '/logo192.png',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        },
        data: {
          advertisementId: advertisement.advertisement_id.toString(),
          type: advertisement.type,
          url: `/advertisement/${advertisement.advertisement_id}`
        }
      };

      // Відправляємо сповіщення кожному токену окремо
      const results = await Promise.all(
        tokens.map(async (token) => {
          try {
            const response = await admin.messaging().send({
              ...message,
              token
            });
            return { token, success: true, response };
          } catch (error) {
            console.error('Error sending to token:', token, error);
            return { token, success: false, error };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log('Notification results:', {
        successCount,
        failureCount,
        total: tokens.length
      });

      // Видалити невалідні токени
      if (failureCount > 0) {
        const failedTokens = results
          .filter(r => !r.success)
          .map(r => r.token);

        if (failedTokens.length > 0) {
          await User.update(
            { fcm_token: null },
            { where: { fcm_token: { [Op.in]: failedTokens } } }
          );
          console.log('Removed invalid tokens:', failedTokens.length);
        }
      }

      return { successCount, failureCount };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();