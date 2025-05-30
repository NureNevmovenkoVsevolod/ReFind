importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCxgFsoIIsQ1djx0b4JEFZpJGsm4ZSUjxo",
  authDomain: "refind-dbebc.firebaseapp.com",
  projectId: "refind-dbebc",
  storageBucket: "refind-dbebc.firebasestorage.app",
  messagingSenderId: "126088919754",
  appId: "1:126088919754:web:956069b73df1efdfaf5233",
  measurementId: "G-1RHXV9H57D"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Отримано фонове повідомлення:', payload);
  
  const { notification } = payload;
  
  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Переглянути'
      },
      {
        action: 'dismiss',
        title: 'Закрити'
      }
    ]
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Клік по сповіщенню:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.advertisementId 
    ? `/advertisement/${event.notification.data.advertisementId}`
    : '/';

  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url.includes(self.location.origin)) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus().then(() => {
        return matchingClient.navigate(fullUrl);
      });
    } else {
      return clients.openWindow(fullUrl);
    }
  });

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Сповіщення закрито:', event);
});