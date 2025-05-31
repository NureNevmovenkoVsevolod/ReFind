import React, { useState, useEffect } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import styles from './ChatPage.module.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
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
        setChatsLoaded(true);
      });
  }, []);

  // Якщо є user в query, створити/відкрити чат (тільки після завантаження чатів)
  useEffect(() => {
    if (!chatsLoaded) return;
    const userTo = searchParams.get('user');
    const advertisementId = searchParams.get('ad');
    if (userTo) {
      const currentUserId = userId;
      const existingChat = chats.find(chat => {
        const user1 = chat.User1?.user_id;
        const user2 = chat.User2?.user_id;
        return (
          (user1 === Number(userTo) && user2 === currentUserId) ||
          (user2 === Number(userTo) && user1 === currentUserId)
        );
      });
      if (existingChat) {
        setSelectedChatId(existingChat.chat_id || existingChat.id);
        return;
      }
      if (advertisementId) {
        const token = localStorage.getItem('token');
        axios.post(`${process.env.REACT_APP_SERVER_URL}/api/chat`, {
          user_id_2: userTo,
          advertisement_id: advertisementId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            setChats(prev => {
              const exists = prev.some(chat => chat.id === res.data.id);
              return exists ? prev : [...prev, res.data];
            });
            setSelectedChatId(res.data.id);
          });
      }
    }
    // eslint-disable-next-line
  }, [searchParams, userId, chatsLoaded]);

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
            isOwn: msg.user_id === userId,
            time: msg.sent_at || msg.createdAt
          })));
        });
    }
  }, [selectedChatId, userId]);

  const handleSelectChat = (id) => {
    setSelectedChatId(id);
  };

  const handleBack = () => {
    setSelectedChatId(null);
    window.history.replaceState({}, document.title, '/chat');
  };

  const handleSendMessage = (msg) => {
    setMessages([...messages, { text: msg, isOwn: true }]);
  };

  const handleDeleteChat = async (chatId) => {
    const token = localStorage.getItem('token');
    const chatToDelete = chats.find(chat => (chat.chat_id || chat.id) === chatId);
    console.log('Видалення чату:', chatId, chatToDelete);
    console.log('Запит на видалення чату:', `${process.env.REACT_APP_SERVER_URL}/api/chat/${chatId}`);
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(prev => prev.filter(chat => (chat.chat_id || chat.id) !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        window.history.replaceState({}, document.title, '/chat');
      }
    } catch (e) {
      alert('Не вдалося видалити чат: ' + (e?.response?.data?.message || e.message));
    }
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
            <ChatList chats={chats} onSelectChat={handleSelectChat} selectedChatId={selectedChatId} onDeleteChat={handleDeleteChat} onBack={handleBack} />
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