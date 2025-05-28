const TRANSLATIONS = {
  en: {
    'navbar.profile': 'Profile',
    'navbar.language': 'Language',
    'toast.categoryAdded': 'Category "{category}" added to tracking',
    'sendMessage': 'Send a message',
    'navbar.ifound': 'I Found',
    'navbar.ilost': 'I Lost',
    'navbar.boardfound': 'Board Found',
    'navbar.boardlost': 'Board Lost',
    'navbar.chat': 'Chat',
    'navbar.logout': 'Logout',
    // ...додати інші ключі за потреби
  },
  uk: {
    'navbar.profile': 'Профіль',
    'navbar.language': 'Мова',
    'toast.categoryAdded': 'Категорію "{category}" додано до відстеження',
    'sendMessage': 'Надіслати повідомлення',
    'navbar.ifound': 'Я знайшов',
    'navbar.ilost': 'Я загубив',
    'navbar.boardfound': 'Знайдені',
    'navbar.boardlost': 'Загублені',
    'navbar.chat': 'Чат',
    'navbar.logout': 'Вийти',
    // ...додати інші ключі за потреби
  },
};

const LANGUAGE_KEY = 'app_language';

function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
}

function setLanguage(lang) {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

function t(key, params = {}) {
  const lang = getLanguage();
  let str = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v);
  });
  return str;
}

export { t, setLanguage, getLanguage }; 