import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Wallet, ArrowUp, ArrowDown, BarChart3, DollarSign } from 'lucide-react';
import '../../components/charts/chartConfig';
import { aggregateTransactions, detectSubscriptions } from '../../services/financeUtils';
import CumulativeNetFlowGraph from '../../components/charts/NetFlowGraph';
import SankeyDiagramSimulation from '../../components/charts/SankeyDiagram';

const C = {
  surface: '#0d1526', raised: '#111e33', border: '#1a2d47', borderHi: '#233d5e',
  txt: '#dce8f5', txt2: '#7a98b8', txt3: '#3f5977',
  accent: '#5b6ff0', green: '#22d3a0', red: '#f05b7c', violet: '#9b7bf0', amber: '#f0a533',
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'1.1rem 1.3rem', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-16, right:-16, width:72, height:72, borderRadius:'50%', background: color, opacity:.08, filter:'blur(10px)' }} />
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', position:'relative' }}>
      <div>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color: C.txt3, marginBottom:6 }}>{label}</p>
        <p style={{ fontSize:22, fontWeight:800, color: C.txt, lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:12, color: C.txt3, marginTop:5 }}>{sub}</p>}
      </div>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'1.3rem' }}>
    <h3 style={{ fontSize:14, fontWeight:700, color: C.txt, marginBottom:'1rem' }}>{title}</h3>
    {children}
  </div>
);

const Dashboard = ({ transactions, categories, goals, memos }) => {
  const { totals, categoryBreakdown } = useMemo(() => aggregateTransactions(transactions, categories), [transactions, categories]);
  const subscriptions = useMemo(() => detectSubscriptions(transactions), [transactions]);

  const expenseLabels = useMemo(() =>
    Object.keys(categoryBreakdown).filter(n => categories.find(c => c.name === n && c.type === 'expense')),
    [categoryBreakdown, categories]);

  const pieData = {
    labels: expenseLabels,
    datasets: [{
      data: expenseLabels.map(n => categoryBreakdown[n]),
      backgroundColor: expenseLabels.map(n => categories.find(c => c.name === n)?.color || C.txt3),
    }],
  };
  const pieOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color: C.txt2, font:{ family:'Inter', size:12 } } } } };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:800, color: C.txt, marginBottom:4 }}>Financial Overview</h2>
        <p style={{ fontSize:13, color: C.txt3 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
        <StatCard label="Net Balance"   value={fmt(totals.balance)} icon={Wallet}   color={totals.balance >= 0 ? C.green : C.red} />
        <StatCard label="Total Income"  value={fmt(totals.income)}  icon={ArrowUp}  color={C.green} />
        <StatCard label="Total Expenses" value={fmt(totals.expense)} icon={ArrowDown} color={C.red} />
        <StatCard label="Transactions"  value={transactions.length} icon={BarChart3} color={C.accent} />
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem' }}>
        <Card title="Cumulative Net Flow">
          <CumulativeNetFlowGraph transactions={transactions} categories={categories} initialBalance={0} />
        </Card>
        <Card title="Expense Breakdown">
          {expenseLabels.length > 0
            ? <div style={{ height:220 }}><Pie data={pieData} options={pieOpts} /></div>
            : <p style={{ textAlign:'center', color: C.txt3, marginTop:'3rem', fontSize:13 }}>No expenses yet</p>}
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <Card title={`Detected Subscriptions (${subscriptions.length})`}>
          {subscriptions.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {subscriptions.map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background: C.raised, borderRadius:10, padding:'10px 14px' }}>
                  <span style={{ fontSize:13, color: C.txt, fontWeight:600 }}>{s.description}</span>
                  <span style={{ fontSize:13, color: C.accent, fontWeight:700 }}>₹{s.amount.toFixed(0)} ×{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: C.txt3, fontSize:13 }}>No recurring patterns detected. Keep logging!</p>
          )}
        </Card>
        <Card title="Money Flow">
          <SankeyDiagramSimulation totals={totals} goals={goals} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
