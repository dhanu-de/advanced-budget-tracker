import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="rounded-2xl p-5 relative overflow-hidden"
    style={{ background: '#0e1625', border: '1px solid #1e3148' }}>
    {/* Background glow */}
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl"
      style={{ background: color }} />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8fa3bc' }}>{title}</p>
        <p className="text-2xl font-bold leading-none" style={{ color: '#e8edf5' }}>
          ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" style={{ color: '#22c55e' }} />
              : <TrendingDown className="w-3 h-3" style={{ color: '#f43f5e' }} />}
            <p className="text-xs font-medium" style={{ color: trend >= 0 ? '#22c55e' : '#f43f5e' }}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </p>
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
  </div>
);
