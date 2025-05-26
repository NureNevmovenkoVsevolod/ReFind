import React from 'react';
import style from './StatsCard.module.css';

function StatsCard({ label, value, icon, gradientFrom, gradientTo }) {

    const cardStyle = {
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
      };

      return (
        <div
          className={style.statcard}
          style={cardStyle}
        >
          <div>
            <div className={style.statlabel}>{label}</div>
            <div className={style.statvalue}>{value}</div>
          </div>
          <div>
            <img src={icon} alt="icon" className={style.staticon} />
          </div>
        </div>
      );
}

export default StatsCard;