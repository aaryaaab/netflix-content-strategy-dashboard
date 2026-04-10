import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './KPICard.css';

const KPICard = ({ title, value, icon, trendData, subtitle }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <h3 className="kpi-title">{title}</h3>
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-footer">
        {trendData ? (
          <>
            <span className={`kpi-trend trend-${trendData.trend}`}>
              {trendData.trend === 'up' && <ArrowUpRight size={16} />}
              {trendData.trend === 'down' && <ArrowDownRight size={16} />}
              {trendData.value}{trendData.value !== 'N/A' && '%'}
            </span>
            <span>vs previous year</span>
          </>
        ) : (
          <span>{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
