import React, { useState, useEffect, useCallback } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import styles from './ChatPage.module.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [interlocutorAd, setInterlocutorAd] = useState(null);
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const socket = io(process.env.REACT_APP_SERVER_URL, { withCredentials: true });

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
  }, [searchParams, userId, chatsLoaded]);

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

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      if (msg.chat_id === selectedChatId) {
        setMessages(prev => [
          ...prev,
          {
            text: msg.message_text,
            isOwn: msg.user_id === userId,
            time: msg.sent_at || msg.createdAt,
          }
        ]);
      }
      setChats(prevChats => {
        let found = false;
        const updated = prevChats.map(chat => {
          const chatId = chat.chat_id || chat.id;
          if (chatId === msg.chat_id) {
            found = true;
            return {
              ...chat,
              Messages: [{
                ...msg,
                User: msg.User || (msg.user_id === userId ? { user_id: userId, first_name: 'Ви' } : (chat.User1?.user_id === msg.user_id ? chat.User1 : chat.User2))
              }],
              updatedAt: msg.sent_at || msg.createdAt || new Date().toISOString()
            };
          }
          return chat;
        });
        if (!found) return prevChats;
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return updated;
      });
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [userId, selectedChatId]);

  const handleSelectChat = useCallback((id) => {
    setSelectedChatId(id);
    const chat = chats.find(c => (c.chat_id || c.id) === id);
    if (chat && chat.advertisement_id) {
      axios.get(`${process.env.REACT_APP_SERVER_URL}/api/advertisement/${chat.advertisement_id}`)
        .then(res => setInterlocutorAd(res.data))
        .catch(() => setInterlocutorAd(null));
    } else {
      setInterlocutorAd(null);
    }
  }, [chats]);

  const handleBack = useCallback(() => {
    setSelectedChatId(null);
    window.history.replaceState({}, document.title, '/chat');
  }, []);

  const handleSendMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { text: msg, isOwn: true }]);
    setChats(prevChats => {
      const updated = prevChats.map(chat => {
        const chatId = chat.chat_id || chat.id;
        if (chatId === selectedChatId) {
          return {
            ...chat,
            Messages: [{
              message_text: msg,
              user_id: userId,
              User: { user_id: userId, first_name: 'Ви' },
              createdAt: new Date().toISOString()
            }],
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      });
      updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return updated;
    });
  }, [selectedChatId, userId]);

  const handleDeleteChat = useCallback(async (chatId) => {
    const token = localStorage.getItem('token');
    const chatToDelete = chats.find(chat => (chat.chat_id || chat.id) === chatId);
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
  }, [chats, selectedChatId]);

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
              advertisement={interlocutorAd}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 