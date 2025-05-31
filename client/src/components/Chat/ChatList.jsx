import React, { useState, memo } from 'react';
import styles from './ChatList.module.css';
import userPfp from '../../assets/user.png';
import { Modal, Button } from 'react-bootstrap';

const ChatList = memo(({ chats, onSelectChat, selectedChatId, onDeleteChat, onBack }) => {
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
  const [showConfirm, setShowConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteChat && chatToDelete) onDeleteChat(chatToDelete);
    setShowConfirm(false);
    setChatToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setChatToDelete(null);
  };

  return (
    <div className={styles.chatList}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>&larr; Назад</button>
      </div>
      <div className={styles.cards}>
        {chats.map(chat => {
          const chatId = chat.chat_id || chat.id;
          const interlocutor = chat.User1?.user_id === currentUserId ? chat.User2 : chat.User1;
          const lastMessage = chat.Messages && chat.Messages[0];
          const lastMsgAuthor = lastMessage?.User?.first_name || (lastMessage?.user_id === currentUserId ? 'Ви' : 'Користувач');
          const lastMsgText = lastMessage?.message_text || '';
          const lastMsgTime = lastMessage?.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
          return (
            <div
              key={chatId}
              className={selectedChatId === chatId ? styles.selectedCard : styles.card}
              onClick={() => onSelectChat(chatId)}
              style={{ position: 'relative' }}
            >
              <div className={styles.avatar}>
                <img
                  src={interlocutor?.user_pfp || userPfp}
                  alt={interlocutor?.first_name || 'User'}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{interlocutor?.first_name || 'User'}</div>
                <div className={styles.lastMessage}>
                  {lastMessage ? (
                    <>
                      <span className={styles.lastMessageAuthor}>{lastMsgAuthor}:</span>
                      <span> {lastMsgText}</span>
                      <span className={styles.lastMessageTime}>{lastMsgTime}</span>
                    </>
                  ) : (
                    <span className={styles.noMessages}>Немає повідомлень</span>
                  )}
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
                onClick={e => handleDeleteClick(e, chatId)}
                title="Видалити чат"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          );
        })}
      </div>
      <Modal show={showConfirm} onHide={handleCancelDelete} centered>
        <Modal.Body style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: 20 }}>Ви дійсно хочете видалити цей чат?</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <Button variant="danger" onClick={handleConfirmDelete} style={{ minWidth: 100 }}>Видалити</Button>
            <Button variant="secondary" onClick={handleCancelDelete} style={{ minWidth: 100 }}>Скасувати</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
});

export default ChatList; 