import React from 'react';
import styles from './ChatList.module.css';

const ChatList = ({ chats, onSelectChat, selectedChatId }) => {
  return (
    <div className={styles.chatList}>
      <div className={styles.header}>
        <button className={styles.backBtn}>&larr; Back</button>
        <div>
          <button className={styles.savedBtn}>Saved</button>
          <button className={styles.deleteBtn}>Delete</button>
        </div>
      </div>
      <div className={styles.cards}>
        {chats.map(chat => (
          <div
            key={chat.id}
            className={selectedChatId === chat.id ? styles.selectedCard : styles.card}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className={styles.avatar}></div>
            <div className={styles.info}>
              <div className={styles.name}>{chat.name}</div>
              <div className={styles.date}>{chat.date}</div>
              <div className={styles.description}>{chat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 