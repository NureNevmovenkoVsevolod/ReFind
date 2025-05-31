import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const ReviewsModal = ({ show, onClose, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!show || !userId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/review/user/${userId}`);
        const data = await response.json();
        setReviews(data);
      } catch (e) {
        console.error('Error fetching reviews:', e);
        setError('Не вдалося завантажити відгуки');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [show, userId]);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Відгуки про вас</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Завантаження...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Поки що немає відгуків</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((review) => (
              <div
                key={review.review_id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}
              >
                <img
                  src={review.Reviewer?.user_pfp || '/user.png'}
                  alt="avatar"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e0e7ef',
                    background: '#fff'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>
                        {review.Reviewer?.first_name} {review.Reviewer?.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {new Date(review.review_date).toLocaleDateString('uk-UA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          style={{
                            width: '20px',
                            height: '20px',
                            fill: star <= review.review_rating ? '#ffc107' : '#e0e0e0'
                          }}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
                      {review.review_text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReviewsModal; 