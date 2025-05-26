import React from 'react';
import style from './ModerStats.module.css';
import StatsDashbord from '../../components/Stats/StatsDashbord/StatsDashbord';
import AdsChart from '../../components/Stats/AdsChart/AdsChart';
import CategoriesChart from '../../components/Stats/CategoriesChart/CategoriesChart';


function ModerStats(props) {
    return (
        <div className={style.container}>
            <StatsDashbord />
            <AdsChart />
            <CategoriesChart />
        </div>
    );
}

export default ModerStats;