import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './ChatWindow.module.css';
import { io } from 'socket.io-client';
import { Modal, Button } from 'react-bootstrap';
import { encodeId } from '../../utils/encodeId';

const socket = io(process.env.REACT_APP_SERVER_URL, {
  withCredentials: true
});

function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const ChatWindow = ({ messages, onSendMessage, inputValue, setInputValue, chatId, userId, advertisement }) => {
  const [realTimeMessages, setRealTimeMessages] = useState(messages);
  const messagesEndRef = useRef(null);
  const [showNoChatModal, setShowNoChatModal] = useState(false);

  // Визначаємо user_id автора оголошення
  const adOwnerId = advertisement?.user_id;
  const isAdOwner = userId === adOwnerId;

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

  const handleRequestContacts = () => {
    if (!chatId || !advertisement) return;
    const message = `__REQUEST_CONTACTS__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
  };

  const handleShareContacts = () => {
    if (!advertisement) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const contactMsg = `Контактні дані:
Ім'я: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nТелефон: ${user.phone_number || 'не вказано'}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: contactMsg
    });
  };

  return (
    <div className={styles.chatWindow}>
      {advertisement && chatId && (
        <a
          href={`/advertisement/${encodeId(advertisement.advertisement_id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.advertBlockLink}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className={styles.advertBlock}>
            {advertisement.Images && advertisement.Images[0] && (
              <img src={advertisement.Images[0].image_url} alt={advertisement.title} className={styles.advertImg} />
            )}
            <div className={styles.advertMainInfo}>
              <div className={styles.advertTitleRow}>
                <span className={styles.advertTitle}>{advertisement.title}</span>
                <span className={styles.advertId}>ID: {advertisement.advertisement_id}</span>
              </div>
              <div className={styles.advertDesc}>{advertisement.description}</div>
            </div>
          </div>
        </a>
      )}
      {!chatId && (
        <div className={styles.emptyChatPlaceholder}>
          <div className={styles.emptyChatIcon}>
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="54" height="54" rx="12" fill="#eaf3ff"/><path d="M16 36V22C16 19.7909 17.7909 18 20 18H34C36.2091 18 38 19.7909 38 22V32C38 34.2091 36.2091 36 34 36H20C18.8954 36 18 36.8954 18 38V38C18 39.1046 18.8954 40 20 40H34" stroke="#0d6dfb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="27" cy="28" r="2" fill="#0d6dfb"/></svg>
          </div>
          <div className={styles.emptyChatTitle}>Це чат ReFind</div>
          <div className={styles.emptyChatText}>Щоб почати переписку, виберіть бесіду зліва</div>
        </div>
      )}
      {chatId && <div style={{ height: '10px' }} />}
      {advertisement && chatId && !isAdOwner && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <Button variant="primary" size="sm" onClick={handleRequestContacts}>
            Запросити контактні дані
          </Button>
        </div>
      )}
      {chatId && (
        <div className={styles.messages}>
          {realTimeMessages.map((msg, idx) => {
            // Відображення службового повідомлення з кнопкою для автора
            if (msg.text.startsWith("__REQUEST_CONTACTS__:") && isAdOwner) {
              const title = msg.text.split(":")[1] || '';
              return (
                <div key={idx} className={styles.message} style={{ background: '#eaf3ff', border: '1px solid #0d6dfb' }}>
                  Користувач просить ваші контактні дані для оголошення "{title}".
                  <Button variant="success" size="sm" style={{ marginLeft: 10 }} onClick={handleShareContacts}>
                    Підтвердити
                  </Button>
                </div>
              );
            }
            // Відображення звичайних повідомлень
            return (
              <div
                key={idx}
                className={msg.isOwn ? styles.ownMessage : styles.message}
                style={{ position: 'relative' }}
              >
                {msg.text}
                <div className={styles.msgTime}>{formatTime(msg.time)}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
      {chatId && (
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
      )}
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