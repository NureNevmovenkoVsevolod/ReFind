import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const ReviewModal = ({
  show,
  onClose,
  reviewer,
  reviewed,
  advertisement,
  reviewText,
  setReviewText,
  reviewRating,
  setReviewRating,
  reviewSubmitting,
  reviewError,
  onSubmit,
  contextText,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkExistingReview = async () => {
      if (!show || !reviewer || !reviewed) return;
      
      setIsChecking(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/review/check?reviewer_id=${reviewer.id || reviewer.user_id}&reviewed_id=${reviewed.user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        
        if (data.exists) {
          alert('Ви вже залишили відгук для цього користувача');
          onClose();
        }
      } catch (e) {
        console.error('Error checking review:', e);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingReview();
  }, [show, reviewer, reviewed, onClose]);

  if (isChecking) {
    return null;
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
        {contextText && (
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, textAlign: 'center' }}>{contextText}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '18px 0 10px 0', justifyContent: 'center' }}>
          <img
            src={reviewed?.user_pfp || '/user.png'}
            alt="avatar"
            style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e7ef', background: '#fff' }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{reviewed?.first_name || reviewed?.user_name || 'Користувач'}</div>
            {reviewed?.email && <div style={{ fontSize: 13, color: '#888' }}>{reviewed.email}</div>}
            {reviewed?.phone && <div style={{ fontSize: 13, color: '#888' }}>{reviewed.phone}</div>}
            <div style={{ fontSize: 13, color: '#888' }}>Ваш співрозмовник</div>
          </div>
        </div>
        {advertisement && (
          <div style={{ background: '#f7faff', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid #e0e7ef', textAlign: 'center' }}>
            <div style={{ fontWeight: 500, fontSize: 16 }}>{advertisement?.title}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{advertisement?.description}</div>
          </div>
        )}
        <div style={{ fontWeight: 600, fontSize: 16, margin: '12px 0 4px 0', textAlign: 'center' }}>Залиште відгук про співрозмовника</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 12, textAlign: 'center' }}>(Це допоможе іншим користувачам)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, justifyContent: 'center' }}>
          {[1,2,3,4,5].map(star => (
            <svg key={star} onClick={() => setReviewRating(star)} style={{ cursor: 'pointer', width: 36, height: 36, fill: star <= reviewRating ? '#ffc107' : '#e0e0e0', transition: 'fill 0.2s' }} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Введіть текст відгуку (обов'язково)"
          style={{ width: '100%', minHeight: 70, borderRadius: 8, border: '1.5px solid #b3cfff', padding: 10, marginBottom: 8, fontSize: 15, resize: 'vertical', outline: reviewError ? '2px solid #e74c3c' : undefined }}
          disabled={reviewSubmitting}
          required
        />
        {reviewError && <div style={{ color: '#e74c3c', marginBottom: 8, fontWeight: 500 }}>{reviewError}</div>}
        <button
          onClick={onSubmit}
          disabled={reviewSubmitting}
          style={{ background: '#0d6dfb', color: '#fff', border: 'none', borderRadius: 7, padding: '12px 0', fontSize: 17, fontWeight: 600, cursor: 'pointer', marginTop: 8, width: '100%', boxShadow: '0 2px 8px rgba(13,109,251,0.08)' }}
        >
          {reviewSubmitting ? 'Відправка...' : 'Залишити відгук'}
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewModal; 