import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { DollarSign, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import '../../components/charts/chartConfig';
import { aggregateTransactions, detectSubscriptions } from '../../services/financeUtils';
import { StatCard } from '../../components/shared/SharedUI';
import CumulativeNetFlowGraph from '../../components/charts/NetFlowGraph';
import SankeyDiagramSimulation from '../../components/charts/SankeyDiagram';

const Dashboard = ({ transactions, categories, goals, memos }) => {
  // Compute totals and breakdowns with memoization
  const { totals, categoryBreakdown } = useMemo(
    () => aggregateTransactions(transactions, categories),
    [transactions, categories]
  );
  const subscriptions = useMemo(
    () => detectSubscriptions(transactions),
    [transactions]
  );

  // Filter only 'expense' categories actually present in categoryBreakdown
  const expenseCategoryLabels = useMemo(
    () =>
      Object.keys(categoryBreakdown).filter(
        (name) => categories.find((c) => c.name === name && c.type === 'expense')
      ),
    [categoryBreakdown, categories]
  );
  const expenseCategoryColors = expenseCategoryLabels.map(name =>
    categories.find((c) => c.name === name)?.color || '#374151'
  );
  const expenseCategoryData = expenseCategoryLabels.map(name => categoryBreakdown[name]);

  const pieData = {
    labels: expenseCategoryLabels,
    datasets: [
      {
        data: expenseCategoryData,
        backgroundColor: expenseCategoryColors,
        hoverBackgroundColor: expenseCategoryColors,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Financial Overview</h2>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Net Balance"
          value={totals.balance}
          icon={DollarSign}
          color="#3B82F6"
          trend={((totals.balance - 0) / (totals.balance || 1)) * 100}
        />
        <StatCard
          title="Total Income"
          value={totals.income}
          icon={ArrowUp}
          color="#10B981"
          trend={5.2}
        />
        <StatCard
          title="Total Expenses"
          value={totals.expense}
          icon={ArrowDown}
          color="#EF4444"
          trend={-2.1}
        />
        <StatCard
          title="Total Transactions"
          value={transactions.length}
          icon={Filter}
          color="#FBBF24"
        />
      </div>

      {/* GRAPHS AND ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Net Flow Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Cumulative Net Flow & Growth</h3>
          <CumulativeNetFlowGraph transactions={transactions} categories={categories} initialBalance={0} />
        </div>

        {/* Spending by Category PIE */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Spending Breakdown (Expenses)</h3>
          {expenseCategoryLabels.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-12">No expenses recorded yet.</p>
          )}
        </div>
      </div>

      {/* ADVANCED PANELS: SUBSCRIPTIONS & SANKEY SIMULATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Detector */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-500 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" /> Detected Subscriptions ({subscriptions.length})
          </h3>
          {subscriptions.length > 0 ? (
            <ul className="space-y-3">
              {subscriptions.map((s, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700"
                >
                  <span className="font-semibold">{s.description}</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ₹{s.amount.toFixed(2)} ({s.count}x)
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recurring patterns detected. Keep logging transactions!</p>
          )}
        </div>

        {/* Sankey Diagram Simulation */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Sankey Money Flow Simulation</h3>
          <p className="text-gray-500 mb-4">Visualizing Income flow to Spending and Goals (Simulated Data).</p>
          <SankeyDiagramSimulation totals={totals} goals={goals} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
