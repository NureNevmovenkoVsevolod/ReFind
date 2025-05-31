import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './ChatWindow.module.css';
import { io } from 'socket.io-client';
import { Modal, Button } from 'react-bootstrap';
import { encodeId } from '../../utils/encodeId';
import SuccessModal from '../Modal/SuccessModal';
import ReviewModal from '../Modal/ReviewModal';

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
  const [showAlreadyRequestedModal, setShowAlreadyRequestedModal] = useState(false);
  const [contactsShared, setContactsShared] = useState(false);
  const [contactsRequested, setContactsRequested] = useState(false);
  const [meetingRequested, setMeetingRequested] = useState(false);
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [showAlreadyMeetingRequestedModal, setShowAlreadyMeetingRequestedModal] = useState(false);
  const [confirmRequested, setConfirmRequested] = useState(false);
  const [confirmConfirmed, setConfirmConfirmed] = useState(false);
  const [showAlreadyConfirmRequestedModal, setShowAlreadyConfirmRequestedModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Визначаємо user_id автора оголошення
  const adOwnerId = advertisement?.user_id;
  const isAdOwner = userId === adOwnerId;
  const isModerator = JSON.parse(localStorage.getItem('user'))?.role === 'moder';

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

  useEffect(() => {
    // Якщо у повідомленнях є контактні дані — блокуємо повторний запит
    const alreadyShared = realTimeMessages.some(msg => msg.text.startsWith('Контактні дані:'));
    setContactsShared(alreadyShared);
    // Якщо вже був запит (__REQUEST_CONTACTS__) — блокуємо повторний запит
    const alreadyRequested = realTimeMessages.some(msg => msg.text.startsWith('__REQUEST_CONTACTS__'));
    setContactsRequested(alreadyRequested);
    // Якщо вже був запит (__REQUEST_MEETING__) — блокуємо повторний запит
    const alreadyMeetingRequested = realTimeMessages.some(msg => msg.text.startsWith('__REQUEST_MEETING__'));
    setMeetingRequested(alreadyMeetingRequested);
    // Якщо вже підтверджено (__MEETING_CONFIRMED__) — показуємо статус
    const alreadyMeetingConfirmed = realTimeMessages.some(msg => msg.text.startsWith('__MEETING_CONFIRMED__'));
    setMeetingConfirmed(alreadyMeetingConfirmed);
    // Якщо вже був запит (__REQUEST_CONFIRM__) — блокуємо повторний запит
    const alreadyConfirmRequested = realTimeMessages.some(msg => msg.text.startsWith('__REQUEST_CONFIRM__'));
    setConfirmRequested(alreadyConfirmRequested);
    // Якщо вже підтверджено (__CONFIRM_CONFIRMED__) — показуємо статус
    const alreadyConfirmConfirmed = realTimeMessages.some(msg => msg.text.startsWith('__CONFIRM_CONFIRMED__'));
    setConfirmConfirmed(alreadyConfirmConfirmed);
  }, [realTimeMessages]);

  useEffect(() => {
    // Відкриваємо модалку для відгуку, якщо підтверджено отримання, але тільки 1 раз
    if (confirmConfirmed && !isAdOwner) {
      const reviewKey = `review_shown_${chatId}`;
      if (!localStorage.getItem(reviewKey)) {
        // Визначаємо співрозмовника
        let interlocutor = null;
        if (advertisement && advertisement.user_id && userId) {
          // Якщо є advertisement, userId — це поточний користувач, advertisement.user_id — власник речі
          interlocutor = {
            user_id: advertisement.user_id,
            first_name: advertisement.user_name || advertisement.user_first_name,
            email: advertisement.user_email,
            phone: advertisement.user_phone
          };
        }
        // Зберігаємо у localStorage
        localStorage.setItem(reviewKey, JSON.stringify(interlocutor));
        checkAndShowReviewModal(interlocutor.user_id);
      }
    }
  }, [confirmConfirmed, isAdOwner, chatId, advertisement, userId]);

  const checkAndShowReviewModal = async (reviewedId) => {
    const reviewer = JSON.parse(localStorage.getItem('user'));
    const reviewerId = reviewer.id || reviewer.user_id;

    if (!reviewerId || !reviewedId) {
      console.error('Missing reviewer or reviewed user ID');
      return;
    }

    const hasReview = await checkExistingReview(reviewerId, reviewedId);
    if (hasReview) {
      // Якщо відгук вже існує, очищаємо localStorage
      const reviewKey = `review_shown_${chatId}`;
      localStorage.removeItem(reviewKey);
      return;
    }

    setShowReviewModal(true);
  };

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
    if (contactsShared || contactsRequested) {
      setShowAlreadyRequestedModal(true);
      return;
    }
    if (!chatId || !advertisement) return;
    const message = `__REQUEST_CONTACTS__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
    setContactsRequested(true);
  };

  const handleShareContacts = () => {
    if (!advertisement) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const contactMsg = `Контактні дані:<br/>Ім'я: ${user.first_name} ${user.last_name}<br/>Email: ${user.email}<br/>Телефон: ${user.phone_number || 'не вказано'}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: contactMsg
    });
  };

  const handleRequestMeeting = () => {
    if (meetingRequested || meetingConfirmed) {
      setShowAlreadyMeetingRequestedModal(true);
      return;
    }
    if (!chatId || !advertisement) return;
    const message = `__REQUEST_MEETING__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
    setMeetingRequested(true);
  };

  const handleConfirmMeeting = () => {
    if (!advertisement) return;
    const message = `__MEETING_CONFIRMED__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
    setMeetingConfirmed(true);
  };

  const handleRequestConfirm = () => {
    if (confirmRequested || confirmConfirmed) {
      setShowAlreadyConfirmRequestedModal(true);
      return;
    }
    if (!chatId || !advertisement) return;
    const message = `__REQUEST_CONFIRM__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
    setConfirmRequested(true);
  };

  const handleConfirmConfirm = () => {
    if (!advertisement) return;
    const message = `__CONFIRM_CONFIRMED__:${advertisement.title}`;
    socket.emit('sendMessage', {
      chat_id: chatId,
      user_id: userId,
      message_text: message
    });
    setConfirmConfirmed(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewRating) {
      setReviewError('Оцініть співрозмовника');
      return;
    }
    if (!reviewText.trim()) {
      setReviewError('Введіть текст відгуку');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const token = localStorage.getItem('token');
      const reviewer = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review_text: reviewText,
          review_rating: reviewRating,
          user_reviewer_id: reviewer.id || reviewer.user_id,
          user_reviewed_id: advertisement?.user_id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReviewError('Помилка: ' + (data.message || 'невідома'));
        console.error('Review error:', data);
        return;
      }
      setShowReviewModal(false);
      setReviewText('');
      setReviewRating(0);
    } catch (e) {
      setReviewError('Не вдалося залишити відгук. Спробуйте ще раз.');
      console.error('Review error:', e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const checkExistingReview = async (reviewerId, reviewedId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/review/check?reviewer_id=${reviewerId}&reviewed_id=${reviewedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.exists;
    } catch (e) {
      console.error('Error checking review:', e);
      return false;
    }
  };

  const handleReviewClick = async () => {
    const reviewer = JSON.parse(localStorage.getItem('user'));
    const reviewerId = reviewer.id || reviewer.user_id;
    const reviewedId = advertisement?.user_id;

    if (!reviewerId || !reviewedId) {
      console.error('Missing reviewer or reviewed user ID');
      return;
    }

    const hasReview = await checkExistingReview(reviewerId, reviewedId);
    if (hasReview) {
      alert('Ви вже залишили відгук для цього користувача');
      return;
    }

    setShowReviewModal(true);
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
      {advertisement && chatId && !isAdOwner && !isModerator && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 8 }}>
          <Button variant="primary" size="sm" onClick={handleRequestContacts} disabled={contactsShared || contactsRequested}>
            Запросити контактні дані
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRequestConfirm} disabled={confirmRequested || confirmConfirmed}>
            Підтвердити отримання речі
          </Button>
          <Button variant="outline-warning" size="sm" onClick={handleReviewClick}>
            Додати відгук
          </Button>
        </div>
      )}
      {chatId && (
        <div className={styles.messages}>
          {realTimeMessages.map((msg, idx) => {
            // Відображення службового повідомлення з кнопкою для автора (контакти)
            if (msg.text.startsWith("__REQUEST_CONTACTS__:")) {
              const title = msg.text.split(":")[1] || '';
              if (isAdOwner) {
                return (
                  <div key={idx} className={styles.message} style={{ background: '#eaf3ff', border: '1px solid #0d6dfb', padding: 16, margin: '10px 0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>
                      Користувач просить ваші контактні дані для оголошення "{title}".
                    </span>
                    <Button variant="success" size="sm" style={{ marginLeft: 16 }} onClick={handleShareContacts} disabled={contactsShared}>
                      Підтвердити
                    </Button>
                  </div>
                );
              } else if (msg.isOwn) {
                return (
                  <div key={idx} className={styles.ownMessage} style={{ background: '#f7f7f7', color: '#444', fontStyle: 'italic', border: '1px solid #b3b3b3', padding: 14, margin: '10px 0', borderRadius: 10 }}>
                    Ви надіслали запит на отримання контактних даних для оголошення "{title}".
                  </div>
                );
              } else {
                return (
                  <div key={idx} className={styles.message} style={{ background: '#f7f7f7', color: '#444', fontStyle: 'italic', border: '1px solid #b3b3b3', padding: 14, margin: '10px 0', borderRadius: 10 }}>
                    Користувач надіслав запит на отримання контактних даних для оголошення "{title}".
                  </div>
                );
              }
            }
            // Відображення службового повідомлення з кнопкою для автора (підтвердження отримання)
            if (msg.text.startsWith("__REQUEST_CONFIRM__:")) {
              const title = msg.text.split(":")[1] || '';
              if (isAdOwner) {
                return (
                  <div key={idx} className={styles.message} style={{ background: '#fffbe6', border: '1px solid #e6c200', padding: 16, margin: '10px 0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>
                      Користувач просить підтвердити отримання речі "{title}".
                    </span>
                    <Button variant="success" size="sm" style={{ marginLeft: 16 }} onClick={handleConfirmConfirm} disabled={confirmConfirmed}>
                      Підтвердити отримання
                    </Button>
                  </div>
                );
              } else if (msg.isOwn) {
                return (
                  <div key={idx} className={styles.ownMessage} style={{ background: '#fffbe6', color: '#444', fontStyle: 'italic', border: '1px solid #e6c200', padding: 14, margin: '10px 0', borderRadius: 10 }}>
                    Ви надіслали запит на підтвердження отримання речі "{title}".
                  </div>
                );
              } else {
                return (
                  <div key={idx} className={styles.message} style={{ background: '#fffbe6', color: '#444', fontStyle: 'italic', border: '1px solid #e6c200', padding: 14, margin: '10px 0', borderRadius: 10 }}>
                    Користувач надіслав запит на підтвердження отримання речі "{title}".
                  </div>
                );
              }
            }
            // Відображення підтвердження отримання
            if (msg.text.startsWith("__CONFIRM_CONFIRMED__:")) {
              const title = msg.text.split(":")[1] || '';
              return (
                <div key={idx} className={styles.message} style={{ background: '#eaffea', border: '1px solid #00c853', padding: 14, margin: '10px 0', borderRadius: 10, fontWeight: 500 }}>
                  Отримання речі "{title}" підтверджено! Дякуємо за користування сервісом.
                </div>
              );
            }
            // Відображення контактних даних з переносами
            if (msg.text.startsWith('Контактні дані:')) {
              return (
                <div
                  key={idx}
                  className={msg.isOwn ? styles.ownMessage : styles.message}
                  style={{ position: 'relative', whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
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
      <Modal show={showAlreadyRequestedModal} onHide={() => setShowAlreadyRequestedModal(false)} centered>
        <Modal.Body style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: 20 }}>Контактні дані вже були запитані або надані. Повторний запит неможливий.</h4>
          <Button variant="primary" onClick={() => setShowAlreadyRequestedModal(false)} style={{ minWidth: 100 }}>ОК</Button>
        </Modal.Body>
      </Modal>
      <Modal show={showAlreadyMeetingRequestedModal} onHide={() => setShowAlreadyMeetingRequestedModal(false)} centered>
        <Modal.Body style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: 20 }}>Запит на зустріч вже був надісланий або підтверджений. Повторний запит неможливий.</h4>
          <Button variant="primary" onClick={() => setShowAlreadyMeetingRequestedModal(false)} style={{ minWidth: 100 }}>ОК</Button>
        </Modal.Body>
      </Modal>
      <Modal show={showAlreadyConfirmRequestedModal} onHide={() => setShowAlreadyConfirmRequestedModal(false)} centered>
        <Modal.Body style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: 20 }}>Запит на підтвердження отримання вже був надісланий або підтверджений. Повторний запит неможливий.</h4>
          <Button variant="primary" onClick={() => setShowAlreadyConfirmRequestedModal(false)} style={{ minWidth: 100 }}>ОК</Button>
        </Modal.Body>
      </Modal>
      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        reviewer={JSON.parse(localStorage.getItem('user'))}
        reviewed={advertisement ? {
          user_pfp: advertisement.user_pfp,
          first_name: advertisement.user_name || advertisement.user_first_name,
          email: advertisement.user_email,
          phone: advertisement.user_phone
        } : {}}
        advertisement={advertisement}
        reviewText={reviewText}
        setReviewText={setReviewText}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewSubmitting={reviewSubmitting}
        reviewError={reviewError}
        onSubmit={handleReviewSubmit}
        contextText={confirmConfirmed ? 'Дякуємо! Ви підтвердили отримання речі.' : undefined}
      />
    </div>
  );
};

export default ChatWindow; 