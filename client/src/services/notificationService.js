// src/services/notificationService.js
import { messaging, getToken, onMessage } from '../config/firebase';
import axios from 'axios';
import { encodeId } from '../utils/encodeId';
import { createRoot } from 'react-dom/client';
import NotificationModal from '../components/NotificationModal/NotificationModal';

class NotificationService {
  constructor() {
    this.token = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const currentPermission = Notification.permission;
      console.log('Current browser permission status:', currentPermission);

      if (currentPermission === 'default') {
        // Створюємо контейнер для модального вікна
        const modalContainer = document.createElement('div');
        modalContainer.id = 'notification-modal-root';
        document.body.appendChild(modalContainer);

        // Створюємо корінь React
        const root = createRoot(modalContainer);

        // Функція для закриття модального вікна
        const closeModal = () => {
          root.unmount();
          document.body.removeChild(modalContainer);
        };

        // Функція для увімкнення сповіщень
        const enableNotifications = async () => {
          closeModal();
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted');
            await this.getTokenAndSave();
            this.setupMessageListener();
            this.isInitialized = true;
          } else {
            console.log('Notification permission denied');
          }
        };

        // Рендеримо модальне вікно
        root.render(
          <NotificationModal
            onEnable={enableNotifications}
            onClose={closeModal}
          />
        );
      } else if (currentPermission === 'granted') {
        console.log('Notification permission already granted');
        await this.getTokenAndSave();
        this.setupMessageListener();
        this.isInitialized = true;
      } else {
        console.log('Notification permission was previously denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async getTokenAndSave() {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });

      if (token) {
        this.token = token;
        await this.saveTokenToServer(token);
        console.log('FCM Token obtained and saved');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  async saveTokenToServer(token) {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/fcm/token`,
        { fcm_token: token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error('Error saving FCM token to server:', error);
    }
  }

  setupMessageListener() {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Показати сповіщення
      if (payload.notification) {
        this.showNotification(payload.notification, payload.data);
      }
    });
  }

  showNotification(notification, data) {
    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        tag: data?.advertisementId,
        data: data
      });

      notif.onclick = () => {
        window.focus();
        if (data?.advertisementId) {
          const encodedId = encodeId(parseInt(data.advertisementId));
          window.location.href = `/advertisement/${encodedId}`;
        }
        notif.close();
      };
    }
  }

  async cleanup() {
    try {
      const authToken = localStorage.getItem('token');
      if (authToken) {
        await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/api/fcm/token`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
    } catch (error) {
      console.error('Error cleaning up FCM token:', error);
    }
  }
}

export default new NotificationService();