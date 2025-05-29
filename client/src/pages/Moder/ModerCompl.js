import React, { useState, useEffect } from 'react';
import style from './ModerCompl.module.css';
import ComplaintCard from '../../components/ComplaintCard/ComplaintCard';
import axios from 'axios';
import Loader from '../../components/Loader/Loader';

function ModerCompl() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_SERVER_URL}/api/complaints`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComplaints(response.data);
            setError(null);
        } catch (err) {
            setError('Помилка при завантаженні скарг');
            console.error('Помилка при завантаженні скарг:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    if (loading) return <Loader />;
    if (error) return <div className={style.error}>{error}</div>;

    return (
        <div className={style.container}>
            <div className={style.content}>
                <h1>Скарги на оголошення</h1>
                {complaints.length === 0 ? (
                    <p className={style.noComplaints}>Немає активних скарг</p>
                ) : (
                    <div className={style.complaintsList}>
                        {complaints.map(complaint => (
                            <ComplaintCard
                                key={complaint.id}
                                complaint={complaint}
                                onStatusChange={fetchComplaints}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModerCompl;