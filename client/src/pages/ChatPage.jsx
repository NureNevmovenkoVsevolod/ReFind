import React, { useState, useEffect } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import styles from './ChatPage.module.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  // Завантаження чатів
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${process.env.REACT_APP_SERVER_URL}/api/chat`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setChats(res.data || []);
      });
  }, []);

  // Якщо є user в query, створити/відкрити чат
  useEffect(() => {
    const userTo = searchParams.get('user');
    if (userTo && userTo !== String(userId)) {
      const token = localStorage.getItem('token');
      axios.post(`${process.env.REACT_APP_SERVER_URL}/api/chat`, { userId: userTo }, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          // Додаємо чат у список, якщо його ще немає
          setChats(prev => {
            const exists = prev.some(chat => chat.id === res.data.id);
            return exists ? prev : [...prev, res.data];
          });
          setSelectedChatId(res.data.id);
        });
    }
  }, [searchParams, userId]);

  // Завантаження повідомлень для вибраного чату
  useEffect(() => {
    if (selectedChatId) {
      const token = localStorage.getItem('token');
      axios.get(`${process.env.REACT_APP_SERVER_URL}/api/chat/${selectedChatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setMessages(res.data.map(msg => ({
            text: msg.message_text,
            isOwn: msg.user_id === userId
          })));
        });
    }
  }, [selectedChatId, userId]);

  const handleSelectChat = (id) => {
    setSelectedChatId(id);
  };

  const handleSendMessage = (msg) => {
    setMessages([...messages, { text: msg, isOwn: true }]);
  };

  return (
    <div className={styles.chatPageWrapper}>
      <div className={styles.chatContainer}>
        {chats.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '60px 0', fontSize: 20, color: '#888' }}>
            У вас ще немає чатів
          </div>
        ) : (
          <>
            <ChatList chats={chats} onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              inputValue={inputValue}
              setInputValue={setInputValue}
              chatId={selectedChatId}
              userId={userId}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 