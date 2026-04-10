import React from 'react';
import { Lightbulb, Target } from 'lucide-react';
import './InsightsPanel.css';

const InsightsPanel = ({ data }) => {
  if (!data || !data.insights) return null;

  return (
    <div className="insights-container">
      <div className="insights-row">
        {data.insights.map((insight, idx) => (
          <div className="insight-card" key={idx}>
            <h4><Lightbulb size={18} /> {insight.title}</h4>
            <p>{insight.description}</p>
          </div>
        ))}
      </div>

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="recommendations-panel">
          <h3><Target size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Strategic Recommendations</h3>
          <ul className="recommendations-list">
            {data.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
