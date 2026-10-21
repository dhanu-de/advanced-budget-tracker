import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { buildMonthlyTimeline } from '../../services/transactionSelectors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const C = {
  accent: '#5b6ff0',
  green:  '#22d3a0',
  red:    '#f05b7c',
  txt2:   '#7a98b8',
  txt3:   '#3f5977',
  raised: '#111e33',
  border: '#1a2d47',
};

const CumulativeNetFlowGraph = ({ transactions = [], categories = [], initialBalance = 0 }) => {
  const [scale, setScale] = useState('monthly');

  const chartData = useMemo(() => {
    const monthly = buildMonthlyTimeline(transactions, categories);
    if (!monthly.length) return { labels: [], datasets: [] };

    let running = initialBalance;
    const cumulativeData = monthly.map(b => {
      running += b.net;
      return running;
    });
    const netFlowData = monthly.map(b => b.net);

    return {
      labels: monthly.map(b => b.label),
      datasets: [
        {
          type: 'line',
          label: 'Cumulative Net Worth',
          data: cumulativeData,
          borderColor: C.accent,
          backgroundColor: `${C.accent}33`,
          fill: false,
          yAxisID: 'y1',
          tension: 0.2,
          order: 1,
          pointRadius: 3,
          pointBackgroundColor: C.accent,
        },
        {
          type: 'bar',
          label: 'Net Flow per Month',
          data: netFlowData,
          backgroundColor: netFlowData.map(v => v >= 0 ? `${C.green}cc` : `${C.red}cc`),
          yAxisID: 'y',
          order: 2,
          borderRadius: 4,
        },
      ],
    };
  }, [transactions, categories, initialBalance]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: C.txt2,
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0d1526',
        borderColor: '#233d5e',
        borderWidth: 1,
        titleColor: '#dce8f5',
        bodyColor: C.txt2,
        callbacks: {
          label: ctx => {
            const val = ctx.raw;
            const sign = val >= 0 ? '+' : '';
            return ` ${ctx.dataset.label}: ${sign}₹${Math.abs(val).toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: C.txt3, font: { size: 11 } },
        grid:  { color: `${C.border}88` },
      },
      y: {
        beginAtZero: true,
        type: 'linear',
        position: 'left',
        ticks: { color: C.txt3, font: { size: 11 }, callback: v => `₹${Math.abs(v).toLocaleString('en-IN')}` },
        grid:  { color: `${C.border}88` },
        title: { display: true, text: 'Net Flow', color: C.txt3, font: { size: 11 } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: { color: C.txt3, font: { size: 11 }, callback: v => `₹${Math.abs(v).toLocaleString('en-IN')}` },
        grid:  { drawOnChartArea: false },
        title: { display: true, text: 'Cumulative Balance', color: C.txt3, font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {transactions.length ? (
        <div style={{ height: 260 }}>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: C.txt3, padding: '3rem 0', fontSize: 13 }}>
          Add transactions to see your financial history here.
        </p>
      )}
    </div>
  );
};

export default CumulativeNetFlowGraph;
