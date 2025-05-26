import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './AdsChart.module.css';
import Loader from '../../Loader/Loader';

const AdsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('week');
    const [type, setType] = useState('all');

    const periodOptions = [
        { value: 'day', label: 'День' },
        { value: 'week', label: 'Тиждень' },
        { value: 'month', label: 'Місяць' },
        { value: 'year', label: 'Рік' }
    ];

    const typeOptions = [
        { value: 'all', label: 'Всі оголошення' },
        { value: 'lost', label: 'Втрачено' },
        { value: 'find', label: 'Знайдено' }
    ];

    const fetchGraphData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await fetch(process.env.REACT_APP_SERVER_URL + `/api/stats/ads/graph?period=${period}&type=${type}`, 
                {headers}
            );

            if (!response.ok) {
                throw new Error('Помилка при завантаженні даних');
            }

            const result = await response.json();
            console.log('Received data:', result);

            if (!result.data || !Array.isArray(result.data)) {
                throw new Error('Некоректний формат даних від сервера');
            }

            setData(result.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching graph data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGraphData();
    }, [period, type]);

    const formatXAxisLabel = (value) => {
        if (!value) return '';
        
        if (period === 'day') {
            return value; 
        } else if (period === 'year') {
            const [year, month] = value.split('-');
            const monthNames = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        } else {
            return value; 
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{`Період: ${formatXAxisLabel(label)}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Динаміка оголошень</h2>
                <div className={styles.controls}>
                    <div className={styles.selectGroup}>
                        <label htmlFor="period-select">Період:</label>
                        <select
                            id="period-select"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className={styles.select}
                        >
                            {periodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.selectGroup}>
                        <label htmlFor="type-select">Тип:</label>
                        <select
                            id="type-select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={styles.select}
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <Loader></Loader>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>Помилка: {error}</p>
                    <button onClick={fetchGraphData} className={styles.retryButton}>
                        Спробувати знову
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                                dataKey="period" 
                                tickFormatter={formatXAxisLabel}
                                stroke="#666"
                            />
                            <YAxis stroke="#666" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="total" 
                                stroke={
                                    type === 'all' ? '#2563eb' : 
                                    type === 'lost' ? '#dc2626' : 
                                    '#16a34a'
                                } 
                                strokeWidth={2}
                                dot={{ 
                                    fill: type === 'all' ? '#2563eb' : 
                                          type === 'lost' ? '#dc2626' : 
                                          '#16a34a', 
                                    strokeWidth: 2, 
                                    r: 4 
                                }}
                                activeDot={{ 
                                    r: 6, 
                                    stroke: type === 'all' ? '#2563eb' : 
                                           type === 'lost' ? '#dc2626' : 
                                           '#16a34a', 
                                    strokeWidth: 2 
                                }}
                                name={
                                    type === 'all' ? 'Всі оголошення' :
                                    type === 'lost' ? 'Втрачено' : 
                                    'Знайдено'
                                }
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {!loading && !error && data.length === 0 && (
                <div className={styles.noData}>
                    <p>Немає даних для відображення за обраний період</p>
                </div>
            )}
        </div>
    );
};

export default AdsChart;