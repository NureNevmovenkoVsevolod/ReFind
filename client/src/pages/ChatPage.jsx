import React, { useState, useEffect } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import styles from './ChatPage.module.css';
import axios from 'axios';

const mockChats = [
  { id: 1, name: 'Name', date: '01.01.2025', description: 'Card description' },
  { id: 2, name: 'Name', date: '01.01.2025', description: 'Card description' },
  { id: 3, name: 'Name', date: '01.01.2025', description: 'Card description' },
  { id: 4, name: 'Name', date: '01.01.2025', description: 'Card description' },
];

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(mockChats[0].id);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

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
        <ChatList chats={mockChats} onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          inputValue={inputValue}
          setInputValue={setInputValue}
          chatId={selectedChatId}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default ChatPage; 