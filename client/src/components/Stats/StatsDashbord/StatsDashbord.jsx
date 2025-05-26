import React, { useEffect, useState } from 'react';
import style from './StatsDashbord.module.css';
import StatsCard from '../StatsCard/StatsCard';
import axios from 'axios';
import clock from '../../../assets/clock.png';
import docum from '../../../assets/google-docs.png';
import lost from '../../../assets/lost.png';
import find from '../../../assets/search.png';
import team from '../../../assets/team.png';
import warning from '../../../assets/warning.png';


function StatsDashbord() {
  const [stats, setStats] = useState({
    ads: 0,
    pending: 0,
    complaints: 0,
    users: 0,
    lost: 0,
    found: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/ads', { headers }),
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/ads/pending', { headers }),
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/complaints/active', { headers }),
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/users', { headers }),
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/ads/lost', { headers }),
      axios.get(process.env.REACT_APP_SERVER_URL + '/api/stats/ads/found', { headers }),
    ]).then(([ads, pending, complaints, users, lost, found]) => {
      setStats({
        ads: ads.data.count,
        pending: pending.data.count,
        complaints: complaints.data.count,
        users: users.data.count,
        lost: lost.data.count,
        found: found.data.count,
      });
    });
  }, []);

  return (
    <div className={style.maincontent}>
      <div className={style.statsgrid}>
        <StatsCard label="Всього оголошень" value={stats.ads} icon={docum} gradientFrom="#2563eb" gradientTo="#1e40af" />
        <StatsCard label="Оголошення на розгляді" value={stats.pending} icon={clock} gradientFrom="#f59e0b" gradientTo="#b45309" />
        <StatsCard label="Активні скарги" value={stats.complaints} icon={warning} gradientFrom="#ef4444" gradientTo="#991b1b" />
        <StatsCard label="Всього користувачів" value={stats.users} icon={team} gradientFrom="#06b6d4" gradientTo="#0e7490" />
        <StatsCard label="Оголошення: втрати" value={stats.lost} icon={lost} gradientFrom="#6366f1" gradientTo="#312e81" />
        <StatsCard label="Оголошення: знахідки" value={stats.found} icon={find} gradientFrom="#84cc16" gradientTo="#4d7c0f" />
      </div>
    </div>
  );
}

export default StatsDashbord;