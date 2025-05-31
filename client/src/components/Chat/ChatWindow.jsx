import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './ChatWindow.module.css';
import { io } from 'socket.io-client';
import { Modal, Button } from 'react-bootstrap';

const socket = io(process.env.REACT_APP_SERVER_URL, {
  withCredentials: true
});

function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const ChatWindow = ({ messages, onSendMessage, inputValue, setInputValue, chatId, userId }) => {
  const [realTimeMessages, setRealTimeMessages] = useState(messages);
  const messagesEndRef = useRef(null);
  const [showNoChatModal, setShowNoChatModal] = useState(false);

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
        isOwn: msg.user_id === userId,
        time: msg.sent_at || msg.createdAt || new Date().toISOString()
      }]);
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realTimeMessages]);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (!chatId) {
      setShowNoChatModal(true);
      return;
    }
    if (inputValue.trim()) {
      socket.emit('sendMessage', {
        chat_id: chatId,
        user_id: userId,
        message_text: inputValue
      });
      setInputValue('');
    }
  }, [inputValue, chatId, userId, setInputValue]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {realTimeMessages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.isOwn ? styles.ownMessage : styles.message}
            style={{ position: 'relative' }}
          >
            {msg.text}
            <div className={styles.msgTime}>{formatTime(msg.time)}</div>
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
          disabled={!chatId}
        />
        <button type="submit" className={styles.sendBtn} disabled={!chatId || !inputValue.trim()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 19 12 5 20 5 4"/></svg>
        </button>
      </form>
      <Modal show={showNoChatModal} onHide={() => setShowNoChatModal(false)} centered>
        <Modal.Body style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: 20 }}>Оберіть чат, щоб надіслати повідомлення</h4>
          <Button variant="primary" onClick={() => setShowNoChatModal(false)} style={{ minWidth: 100 }}>ОК</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChatWindow; 