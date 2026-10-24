import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Tooltip, Legend, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowUp, ArrowDown, AlertCircle,
} from 'lucide-react';

ChartJS.register(
  ArcElement, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Tooltip, Legend, Filler
);

/* ── helpers ──────────────────────────────────────────────────────────── */
const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

const COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#14b8a6','#f97316','#94a3b8',
];

const cardStyle = {
  background:'#fff', borderRadius:14, padding:'1.2rem',
  border:'1px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
};

function StatCard({ label, value, icon: Icon, color, sub, trend }) {
  return (
    <div style={{ ...cardStyle, display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={22} color={color}/>
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:22, fontWeight:800, color:'#1e293b', lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:12, color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8', marginTop:4, fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────── */
export default function Dashboard({ transactions = [], categories = [], goals = [] }) {
  const [range, setRange] = useState('30D');

  /* totals */
  const { income, expense, balance, expByCategory, monthlyData } = useMemo(() => {
    let income = 0, expense = 0;
    const expByCategory = {};
    const monthly = {};

    const cutoff = range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90 : 365;
    const since  = Date.now() - cutoff * 864e5;

    for (const t of transactions) {
      const d    = new Date(t.date);
      const amt  = Math.abs(Number(t.amount));
      const type = t.type || 'expense';
      const cat  = categories.find(c => c.id === t.categoryId || c.name === t.category);
      const catName = cat?.name || t.category || 'Others';

      // monthly (all time)
      const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!monthly[mk]) monthly[mk] = { income:0, expense:0 };
      if (type === 'income') monthly[mk].income += amt;
      else                   monthly[mk].expense += amt;

      // within range
      if (d.getTime() < since) continue;
      if (type === 'income') income += amt;
      else {
        expense += amt;
        expByCategory[catName] = (expByCategory[catName] || 0) + amt;
      }
    }

    const monthlyData = Object.entries(monthly)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [y, m] = k.split('-').map(Number);
        return { label: new Date(y, m-1).toLocaleDateString('en-IN',{month:'short',year:'2-digit'}), ...v };
      });

    return { income, expense, balance: income - expense, expByCategory, monthlyData };
  }, [transactions, categories, range]);

  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(0) : 0;
  const completedGoals = goals.filter(g => Number(g.saved) >= Number(g.target)).length;

  /* ── Doughnut chart data ─── */
  const donutData = {
    labels: Object.keys(expByCategory).slice(0, 8),
    datasets: [{
      data:            Object.values(expByCategory).slice(0, 8),
      backgroundColor: COLORS,
      borderWidth:     0,
      hoverOffset:     6,
    }],
  };

  /* ── Bar chart data ─── */
  const barData = {
    labels: monthlyData.map(d => d.label),
    datasets: [
      { label:'Income',  data: monthlyData.map(d => d.income),  backgroundColor:'rgba(99,102,241,0.85)', borderRadius:6 },
      { label:'Expense', data: monthlyData.map(d => d.expense), backgroundColor:'rgba(239,68,68,0.75)',  borderRadius:6 },
    ],
  };

  /* ── Line (balance) chart data ─── */
  const lineData = {
    labels: monthlyData.map(d => d.label),
    datasets: [{
      label:'Net Balance',
      data:  monthlyData.map(d => d.income - d.expense),
      borderColor:'#10b981',
      backgroundColor:'rgba(16,185,129,0.08)',
      tension:0.4,
      fill:true,
      pointRadius:4,
      pointBackgroundColor:'#10b981',
    }],
  };

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{ x:{ grid:{ display:false }, ticks:{ color:'#94a3b8', font:{ family:'Inter', size:11 } } }, y:{ grid:{ color:'#f1f5f9' }, ticks:{ color:'#94a3b8', font:{ family:'Inter', size:11 }, callback: v => `₹${v>=1000?(v/1000).toFixed(0)+'k':v}` } } },
  };

  const donutOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ font:{ family:'Inter', size:11 }, color:'#475569', boxWidth:12, padding:12 } } },
    cutout:'65%',
  };

  const RANGE_BTNS = [['7D','7 Days'],['30D','30 Days'],['90D','90 Days'],['1Y','1 Year']];

  /* ── Recent transactions ─── */
  const recent = transactions.slice(0, 6);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', fontFamily:'Inter,sans-serif' }}>

      {/* Range filter */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#1e293b' }}>Financial Overview</h2>
        <div style={{ display:'flex', gap:6 }}>
          {RANGE_BTNS.map(([val, lbl]) => (
            <button key={val} onClick={() => setRange(val)} style={{
              padding:'5px 12px', borderRadius:20, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer',
              borderColor: range===val ? '#6366f1' : '#e2e8f0',
              background:  range===val ? '#6366f1' : '#fff',
              color:       range===val ? '#fff'    : '#64748b',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'1rem' }}>
        <StatCard label="Total Income"   value={fmt(income)}   icon={TrendingUp}   color="#10b981" sub={`Savings rate: ${savingsRate}%`} trend="up"/>
        <StatCard label="Total Expenses" value={fmt(expense)}  icon={TrendingDown}  color="#ef4444" sub={`${transactions.filter(t=>t.type==='expense').length} transactions`} trend="down"/>
        <StatCard label="Net Balance"    value={fmt(Math.abs(balance))} icon={Wallet} color={balance>=0?"#6366f1":"#ef4444"} sub={balance>=0?'Surplus 🎉':'Overspending ⚠'} trend={balance>=0?'up':'down'}/>
        <StatCard label="Goals"          value={`${completedGoals}/${goals.length}`} icon={Target} color="#f59e0b" sub={`${goals.length-completedGoals} in progress`}/>
      </div>

      {/* Charts row 1: Bar + Doughnut */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1rem' }}>
        <div style={{ ...cardStyle }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Income vs Expenses</p>
          <p style={{ fontSize:12, color:'#94a3b8', marginBottom:12 }}>Monthly breakdown</p>
          <div style={{ height:220 }}>
            {monthlyData.length > 0
              ? <Bar data={barData} options={chartOpts}/>
              : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', fontSize:13 }}>No data yet — add transactions!</div>}
          </div>
          {/* Legend */}
          <div style={{ display:'flex', gap:16, marginTop:10 }}>
            {[['#6366f1','Income'],['#ef4444','Expense']].map(([c,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
                <span style={{ fontSize:11, color:'#64748b' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Spending Breakdown</p>
          <p style={{ fontSize:12, color:'#94a3b8', marginBottom:12 }}>By category</p>
          <div style={{ height:220 }}>
            {Object.keys(expByCategory).length > 0
              ? <Doughnut data={donutData} options={donutOpts}/>
              : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', fontSize:13 }}>No expenses yet</div>}
          </div>
        </div>
      </div>

      {/* Charts row 2: Line */}
      <div style={{ ...cardStyle }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Net Balance Trend</p>
        <p style={{ fontSize:12, color:'#94a3b8', marginBottom:12 }}>Monthly net (income − expenses)</p>
        <div style={{ height:180 }}>
          {monthlyData.length > 0
            ? <Line data={lineData} options={{ ...chartOpts, plugins:{ ...chartOpts.plugins, legend:{ display:false } } }}/>
            : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', fontSize:13 }}>No data yet</div>}
        </div>
      </div>

      {/* Goals progress + Recent transactions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {/* Goals */}
        <div style={{ ...cardStyle }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:14 }}>Savings Goals</p>
          {goals.length === 0 && <p style={{ color:'#94a3b8', fontSize:13 }}>No goals yet. Create one!</p>}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {goals.slice(0,4).map(g => {
              const pct = Math.min(100, (Number(g.saved)/Number(g.target))*100);
              const done = pct >= 100;
              return (
                <div key={g.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{g.title}</span>
                    <span style={{ fontSize:12, color: done?'#10b981':'#6366f1', fontWeight:700 }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, borderRadius:4, background: done?'#10b981':'linear-gradient(90deg,#6366f1,#8b5cf6)', transition:'width 0.4s' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:11, color:'#94a3b8' }}>Saved: {fmt(g.saved)}</span>
                    <span style={{ fontSize:11, color:'#94a3b8' }}>Goal: {fmt(g.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent */}
        <div style={{ ...cardStyle }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:14 }}>Recent Transactions</p>
          {recent.length === 0 && <p style={{ color:'#94a3b8', fontSize:13 }}>No transactions yet.</p>}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {recent.map(t => {
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background: isIncome?'#dcfce7':'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {isIncome ? <ArrowUp size={14} color="#16a34a"/> : <ArrowDown size={14} color="#dc2626"/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description || t.title}</p>
                    <p style={{ fontSize:11, color:'#94a3b8' }}>{new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</p>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color: isIncome?'#16a34a':'#dc2626', whiteSpace:'nowrap' }}>
                    {isIncome?'+':'−'}{fmt(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget health indicator */}
      {transactions.length > 0 && (
        <div style={{ ...cardStyle, display:'flex', alignItems:'center', gap:12,
          background: balance >= 0 ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${balance >= 0 ? '#bbf7d0' : '#fecaca'}`,
        }}>
          <AlertCircle size={18} color={balance>=0?'#16a34a':'#dc2626'}/>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color: balance>=0?'#15803d':'#b91c1c' }}>
              {balance >= 0
                ? `Great job! You're saving ${savingsRate}% of your income.`
                : 'You are spending more than you earn this period.'}
            </p>
            <p style={{ fontSize:12, color: balance>=0?'#16a34a':'#dc2626', opacity:0.8, marginTop:2 }}>
              {balance >= 0
                ? `Net surplus: ${fmt(balance)}`
                : `Overspent by: ${fmt(Math.abs(balance))} — consider cutting expenses.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
