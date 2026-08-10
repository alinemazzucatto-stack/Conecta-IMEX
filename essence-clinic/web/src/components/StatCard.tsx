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
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
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
