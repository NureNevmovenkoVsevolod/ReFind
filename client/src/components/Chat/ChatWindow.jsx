import React, { useRef, useEffect, useState } from 'react';
import styles from './ChatWindow.module.css';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_URL, {
  withCredentials: true
});

const ChatWindow = ({ messages, onSendMessage, inputValue, setInputValue, chatId, userId }) => {
  const [realTimeMessages, setRealTimeMessages] = useState(messages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('joinChat', chatId);
  }, [chatId]);

  useEffect(() => {
    setRealTimeMessages(messages);
  }, [messages]);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setRealTimeMessages(prev => [...prev, {
        text: msg.message_text,
        isOwn: msg.user_id === userId
      }]);
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realTimeMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const msg = {
        chat_id: chatId,
        user_id: userId,
        message_text: inputValue
      };
      socket.emit('sendMessage', msg);
      setInputValue('');
    }
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {realTimeMessages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.isOwn ? styles.ownMessage : styles.message}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className={styles.inputBar} onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Enter a message"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.sendBtn}>
          <span>&#9654;</span>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow; 