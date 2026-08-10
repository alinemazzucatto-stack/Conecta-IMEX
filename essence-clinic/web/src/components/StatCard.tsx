import React from 'react';
import '../styles/stat-card.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'indigo';
}

export default function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    purple: 'from-cyan-400 to-blue-600',
    blue: 'from-cyan-400 to-blue-600',
    green: 'from-cyan-400 to-blue-600',
    pink: 'from-cyan-400 to-blue-600',
    orange: 'from-cyan-400 to-blue-600',
    indigo: 'from-cyan-400 to-blue-600',
  };

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon bg-gradient-to-br ${colorMap[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>

      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
