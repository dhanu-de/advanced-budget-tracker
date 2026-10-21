import React, { useMemo, useState, lazy, Suspense } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Wallet, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import '../../components/charts/chartConfig';
import {
  aggregateTransactions,
  detectSubscriptions,
} from '../../services/transactionSelectors';
import SankeyDiagramSimulation from '../../components/charts/SankeyDiagram';
import TiltCard from '../../components/3d/TiltCard';
import Skeleton3D from '../../components/3d/Skeleton3D';

// Lazy-load heavy 3D components
const NetWorthOrb    = lazy(() => import('../../components/3d/NetWorthOrb'));
const CategoryDonut3D = lazy(() => import('../../components/3d/CategoryDonut3D'));
const NetFlowBars3D  = lazy(() => import('../../components/3d/NetFlowBars3D'));

ChartJS.register(ArcElement, Tooltip, Legend);

const C = {
  surface:  '#0d1526',
  raised:   '#111e33',
  border:   '#1a2d47',
  borderHi: '#233d5e',
  txt:      '#dce8f5',
  txt2:     '#7a98b8',
  txt3:     '#3f5977',
  accent:   '#5b6ff0',
  green:    '#22d3a0',
  red:      '#f05b7c',
  violet:   '#9b7bf0',
  amber:    '#f0a533',
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <TiltCard
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '1.1rem 1.3rem',
      overflow: 'hidden',
      cursor: 'default',
    }}
  >
    <div style={{ position: 'absolute', top: -16, right: -16, width: 72, height: 72, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(10px)' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: C.txt3, marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: C.txt, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: C.txt3, marginTop: 5 }}>{sub}</p>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </TiltCard>
);

const Card = ({ title, children, action }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.3rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = ({ transactions, categories, goals, memos }) => {
  const [categoryFilter, setCategoryFilter] = useState(null);

  const { totals, categoryBreakdown } = useMemo(
    () => aggregateTransactions(transactions, categories),
    [transactions, categories]
  );
  const subscriptions = useMemo(() => detectSubscriptions(transactions), [transactions]);

  // Expense categories with amounts
  const expenseLabels = useMemo(() =>
    Object.keys(categoryBreakdown).filter(n => {
      const cat = categories.find(c => c.name === n);
      return cat?.type === 'expense' && categoryBreakdown[n] > 0;
    }),
    [categoryBreakdown, categories]
  );

  const pieData = {
    labels: expenseLabels,
    datasets: [{
      data: expenseLabels.map(n => categoryBreakdown[n]),
      backgroundColor: expenseLabels.map(n => categories.find(c => c.name === n)?.color || C.txt3),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };
  const pieOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: C.txt2, font: { family: 'Inter', size: 12 }, padding: 12, boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#0d1526', borderColor: '#233d5e', borderWidth: 1,
        titleColor: C.txt, bodyColor: C.txt2,
        callbacks: { label: ctx => ` ₹${Number(ctx.raw).toLocaleString('en-IN')} (${totals.expense ? ((ctx.raw / totals.expense) * 100).toFixed(1) : 0}%)` },
      },
    },
  };

  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.txt, marginBottom: 4 }}>Financial Overview</h2>
        <p style={{ fontSize: 13, color: C.txt3 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Top section: Orb + Stat cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-start">
        {/* Net Worth Orb */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.3rem', display: 'flex', justifyContent: 'center' }}>
          <Suspense fallback={<Skeleton3D height={200} />}>
            <NetWorthOrb totals={totals} />
          </Suspense>
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Income"   value={fmt(totals.income)}  icon={ArrowUp}   color={C.green}  />
          <StatCard label="Total Expenses" value={fmt(totals.expense)} icon={ArrowDown} color={C.red}    />
          <StatCard label="Transactions"   value={transactions.length} icon={BarChart3} color={C.accent} />
          <StatCard
            label="Savings Rate"
            value={`${totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0}%`}
            icon={Wallet}
            color={C.violet}
          />
        </div>
      </div>

      {/* ── 3D Net Flow Bars ──────────────────────────────────────────────── */}
      <Card title="Net Flow Timeline">
        <Suspense fallback={<Skeleton3D height={280} />}>
          <NetFlowBars3D transactions={transactions} categories={categories} />
        </Suspense>
      </Card>

      {/* ── Charts Row: 3D donut + subscriptions ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Expense Breakdown"
          action={categoryFilter && (
            <button
              onClick={() => setCategoryFilter(null)}
              style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, border: `1px solid ${C.accent}40`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
            >
              Clear filter ×
            </button>
          )}
        >
          <Suspense fallback={<Skeleton3D height={300} />}>
            <CategoryDonut3D
              categoryBreakdown={categoryBreakdown}
              categories={categories}
              onCategoryFilter={setCategoryFilter}
            />
          </Suspense>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card title={`Detected Subscriptions (${subscriptions.length})`}>
            {subscriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subscriptions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.raised, borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 13, color: C.txt, fontWeight: 600 }}>{s.description}</span>
                    <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>₹{s.amount.toFixed(0)} ×{s.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: C.txt3, fontSize: 13 }}>No recurring patterns detected. Keep logging!</p>
            )}
          </Card>

          <Card title="Money Flow">
            <SankeyDiagramSimulation totals={totals} goals={goals} />
          </Card>
        </div>
      </div>

      {/* Active category filter banner */}
      {categoryFilter && (
        <div style={{ padding: '10px 16px', background: `${C.accent}12`, border: `1px solid ${C.accent}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: C.txt2 }}>
            Showing transactions for: <strong style={{ color: C.txt }}>{categoryFilter}</strong>
          </span>
          <button onClick={() => setCategoryFilter(null)} style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear ×</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
