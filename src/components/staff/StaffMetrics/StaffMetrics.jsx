import React from 'react';
import { Users, Clock, Target, Zap, Clipboard, PenTool } from 'lucide-react';
import './StaffMetrics.css';

const iconMap = {
  users: Users,
  clock: Clock,
  target: Target,
  zap: Zap,
  clipboard: Clipboard,
  'pen-tool': PenTool,
};

const StaffMetrics = ({ metrics }) => {
  return (
    <div className="staff-metrics-grid">
      {metrics.map((metric, idx) => {
        const Icon = iconMap[metric.icon] || Clipboard;
        return (
          <div
            key={idx}
            className={`staff-metric-card ${metric.highlight ? `staff-metric-card--${metric.highlight}` : ''}`}
          >
            <div className="staff-metric-card__header">
              <span className="staff-metric-card__label">{metric.label}</span>
              <div className="staff-metric-card__icon">
                <Icon size={16} />
              </div>
            </div>
            <div className="staff-metric-card__value">{metric.value}</div>
            <p className="staff-metric-card__sub">
              {metric.highlight === 'red' && (
                <span className="metric-critical-badge">{metric.sub}</span>
              )}
              {metric.highlight !== 'red' && metric.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StaffMetrics;
