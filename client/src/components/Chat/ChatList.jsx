import React from 'react';
import styles from './ChatList.module.css';
import userPfp from '../../assets/user.png';

const ChatList = ({ chats, onSelectChat, selectedChatId, onDeleteChat }) => {
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
  return (
    <div className={styles.chatList}>
      <div className={styles.header}>
        <button className={styles.backBtn}>&larr; Back</button>
        <div>
          <button className={styles.savedBtn}>Saved</button>
          <button
            className={styles.deleteBtn}
            onClick={() => {
              if (selectedChatId && onDeleteChat) onDeleteChat(selectedChatId);
            }}
            disabled={!selectedChatId}
          >
            Delete
          </button>
        </div>
      </div>
      <div className={styles.cards}>
        {chats.map(chat => {
          const interlocutor = chat.User1?.user_id === currentUserId ? chat.User2 : chat.User1;
          return (
            <div
              key={chat.chat_id || chat.id}
              className={selectedChatId === (chat.chat_id || chat.id) ? styles.selectedCard : styles.card}
              onClick={() => onSelectChat(chat.chat_id || chat.id)}
            >
              <div className={styles.avatar}>
                <img
                  src={interlocutor?.user_pfp || userPfp}
                  alt={interlocutor?.first_name || 'User'}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{interlocutor?.first_name || 'User'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList; 