import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import styles from './CategoriesChart.module.css';
import Loader from '../../Loader/Loader';

// Реєструємо необхідні компоненти Chart.js
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title
);

const CategoriesChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Масив кольорів для категорій
    const backgroundColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC249', '#EA526F', '#23B5D3', '#279AF1'
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(process.env.REACT_APP_SERVER_URL + '/api/stats/categories', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Помилка при завантаженні даних');
                }

                const result = await response.json();
                
                if (!result.data || !Array.isArray(result.data)) {
                    throw new Error('Некоректний формат даних від сервера');
                }

                // Підраховуємо загальну кількість оголошень
                const total = result.data.reduce((sum, item) => sum + item.count, 0);

                // Форматуємо дані для графіка
                const chartData = {
                    labels: result.data.map(item => 
                        `${item.category} (${((item.count / total) * 100).toFixed(1)}%)`
                    ),
                    datasets: [{
                        data: result.data.map(item => item.count),
                        backgroundColor: backgroundColors.slice(0, result.data.length),
                        borderWidth: 1
                    }]
                };

                setData(chartData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching categories data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} оголошень`;
                    }
                }
            },
            title: {
                display: true,
                text: 'Статистика за категоріями',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>Помилка: {error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                    Спробувати знову
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.noData}>
                <p>Немає даних для відображення</p>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default CategoriesChart; 