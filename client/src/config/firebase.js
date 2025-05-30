import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCxgFsoIIsQ1djx0b4JEFZpJGsm4ZSUjxo",
  authDomain: "refind-dbebc.firebaseapp.com",
  projectId: "refind-dbebc",
  storageBucket: "refind-dbebc.firebasestorage.app",
  messagingSenderId: "126088919754",
  appId: "1:126088919754:web:956069b73df1efdfaf5233",
  measurementId: "G-1RHXV9H57D"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export { getToken, onMessage };