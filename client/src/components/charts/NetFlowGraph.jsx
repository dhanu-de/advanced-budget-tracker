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

const CumulativeNetFlowGraph = ({ transactions = [], categories = [], initialBalance = 0 }) => {
  const [scale, setScale] = useState('monthly');

  const chartData = useMemo(() => {
    if (!transactions.length) return { labels: [], datasets: [] };

    // Sort by date
    const sortedTransactions = [...transactions].sort((a, b) => a.date - b.date);
    const aggregatedData = {};
    let cumulativeBalance = initialBalance;

    for (const t of sortedTransactions) {
      // Defensive date construction
      const dateObj = t.date instanceof Date ? t.date : new Date(t.date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const key =
        scale === 'monthly'
          ? `${year}-${String(month + 1).padStart(2, '0')}`
          : `${year}`;

      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          income: 0,
          expense: 0,
          netFlow: 0,
          cumulativeStart: cumulativeBalance,
        };
      }
      const category = categories.find((c) => c.id === t.categoryId);
      const amt = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      if (category?.type === 'income') {
        aggregatedData[key].income += amt;
        cumulativeBalance += amt;
      } else if (category?.type === 'expense') {
        aggregatedData[key].expense += amt;
        cumulativeBalance -= amt;
      }
      aggregatedData[key].netFlow = aggregatedData[key].income - aggregatedData[key].expense;
    }

    // X axis labels sorted chronologically
    const labels = Object.keys(aggregatedData).sort();
    let runningTotal = initialBalance;
    const cumulativeData = labels.map((key) => {
      runningTotal += aggregatedData[key].netFlow;
      return runningTotal;
    });
    const netFlowData = labels.map((key) => aggregatedData[key].netFlow);

    // Present labels in readable format
    const prettyLabels = labels.map((l) => {
      if (scale === 'monthly') {
        const parts = l.split('-');
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        return !isNaN(y) && !isNaN(m)
          ? new Date(y, m - 1).toLocaleDateString('en-IN', { year: '2-digit', month: 'short' })
          : l;
      }
      return l;
    });

    return {
      labels: prettyLabels,
      datasets: [
        {
          type: 'line',
          label: 'Cumulative Net Worth',
          data: cumulativeData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.2)',
          fill: false,
          yAxisID: 'y1',
          tension: 0.2,
          order: 1
        },
        {
          type: 'bar',
          label: `Net Flow per ${scale === 'monthly' ? 'Month' : 'Year'}`,
          data: netFlowData,
          backgroundColor: netFlowData.map((v) => v >= 0 ? '#10B981' : '#EF4444'),
          yAxisID: 'y',
          order: 2
        }
      ],
    };
  }, [transactions, categories, scale, initialBalance]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Net Flow (Bar)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Cumulative Balance (Line)' },
        grid: { drawOnChartArea: false },
      },
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <label className="mr-2 font-medium text-sm text-gray-700 dark:text-gray-300" htmlFor="scale-select">
          View by:
        </label>
        <select
          id="scale-select"
          value={scale}
          onChange={(e) => setScale(e.target.value)}
          className="p-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="monthly">Month</option>
          <option value="yearly">Year</option>
        </select>
      </div>
      {transactions.length ? (
        <div className='h-96'>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-12 h-96 flex items-center justify-center">
          Add transactions to see your financial history here.
        </p>
      )}
    </div>
  );
};

export default CumulativeNetFlowGraph;
