import React, { useState, useEffect, useCallback } from 'react';
import {
  addTransaction as addTransactionAPI,
  getTransactions as getTransactionsAPI,
  deleteTransaction as deleteTransactionAPI,
  addGoal as addGoalAPI,
  getGoals as getGoalsAPI,
  contributeGoal as contributeGoalAPI,
  deleteGoal as deleteGoalAPI,
  logout as doLogout,
  onAuthChange,
  updateUserName,
} from '../services/firebaseService';
import SignInPage      from './Auth/SignInPage';
import Dashboard       from './Dashboard/Dashboard';
import TransactionView from './Transactions/TransactionView';
import GoalsView       from './Goals/GoalsView';
import SplitBillView   from './Split/SplitBillView';
import GroupSplitView  from './Split/GroupSplitView';
import ProfileView     from './Profile/ProfileView';
import AIChatBot       from '../components/shared/AIChatBot';
import {
  LayoutDashboard, ArrowLeftRight, Target,
  Scissors, Users, UserCircle, Menu, X, Download,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 1,  name: 'Salary',        type: 'income',  color: '#10B981' },
  { id: 2,  name: 'Freelance',     type: 'income',  color: '#06B6D4' },
  { id: 3,  name: 'Rent',          type: 'expense', color: '#EF4444' },
  { id: 4,  name: 'Food',          type: 'expense', color: '#F59E0B' },
  { id: 5,  name: 'Transport',     type: 'expense', color: '#8B5CF6' },
  { id: 6,  name: 'Entertainment', type: 'expense', color: '#EC4899' },
  { id: 7,  name: 'Health',        type: 'expense', color: '#14B8A6' },
  { id: 8,  name: 'Education',     type: 'expense', color: '#3B82F6' },
  { id: 9,  name: 'Savings',       type: 'income',  color: '#22C55E' },
  { id: 10, name: 'Others',        type: 'expense', color: '#94A3B8' },
];

const NAV = [
  { key: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'transactions',label: 'Transactions', icon: ArrowLeftRight  },
  { key: 'goals',       label: 'Goals',        icon: Target          },
  { key: 'split',       label: 'Split Bill',   icon: Scissors        },
  { key: 'group-split', label: 'Group',        icon: Users           },
  { key: 'profile',     label: 'Profile',      icon: UserCircle      },
];

export default function App() {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState('dashboard');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [transactions,  setTransactions]  = useState([]);
  const [goals,         setGoals]         = useState([]);
  const [splitExpenses, setSplitExpenses] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall,   setShowInstall]   = useState(false);

  const categories = DEFAULT_CATEGORIES;

  /* ── PWA install banner ──────────────────────────────────────────── */
  useEffect(() => {
    const h = e => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  /* ── Load data ───────────────────────────────────────────────────── */
  const loadData = useCallback(async uid => {
    if (!uid) return;
    const [txs, gls] = await Promise.all([
      getTransactionsAPI(uid),
      getGoalsAPI(uid),
    ]);
    setTransactions(txs);
    setGoals(gls);
  }, []);

  /* ── Auth ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const unsub = onAuthChange(async u => {
      if (u) { setUser(u); await loadData(u.id); }
      else   { setUser(null); setTransactions([]); setGoals([]); }
      setLoading(false);
    });
    return unsub;
  }, [loadData]);

  /* ── Transactions ────────────────────────────────────────────────── */
  const addTransaction = async tx => {
    const saved = await addTransactionAPI(user.id, tx);
    setTransactions(p => [saved, ...p]);
    return saved;
  };
  const deleteTransaction = async id => {
    await deleteTransactionAPI(user.id, id);
    setTransactions(p => p.filter(t => t.id !== id));
  };

  /* ── Goals ───────────────────────────────────────────────────────── */
  const addGoal = async g => {
    const saved = await addGoalAPI(user.id, g);
    setGoals(p => [saved, ...p]);
  };
  const contributeToGoal = async (id, amount) => {
    await contributeGoalAPI(user.id, id, amount);
    setGoals(p => p.map(g => g.id === id ? { ...g, saved: Number(g.saved) + Number(amount) } : g));
  };
  const deleteGoal = async id => {
    await deleteGoalAPI(user.id, id);
    setGoals(p => p.filter(g => g.id !== id));
  };

  /* ── Split ───────────────────────────────────────────────────────── */
  const addSplitExpense = p => {
    setSplitExpenses(prev => [{ ...p, id: Date.now().toString() }, ...prev]);
  };

  /* ── Logout ──────────────────────────────────────────────────────── */
  const handleLogout = () => { doLogout(); setUser(null); setTransactions([]); setGoals([]); };

  /* ── Update name ─────────────────────────────────────────────────── */
  const handleUpdateName = async name => {
    if (updateUserName) await updateUserName(user.id, name);
    setUser(p => ({ ...p, name }));
  };

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8fafc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <p style={{ color:'#64748b', fontFamily:'Inter,sans-serif', fontSize:14 }}>Loading BudgetFlow…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <SignInPage onLogin={u => { setUser(u); loadData(u.id); }} />;

  /* ── Render page ─────────────────────────────────────────────────── */
  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard transactions={transactions} categories={categories} goals={goals} />;
      case 'transactions': return <TransactionView transactions={transactions} categories={categories} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />;
      case 'goals':        return <GoalsView goals={goals} addGoal={addGoal} contributeToGoal={contributeToGoal} deleteGoal={deleteGoal} />;
      case 'split':        return <SplitBillView categories={categories} addTransaction={addTransaction} />;
      case 'group-split':  return <GroupSplitView splitExpenses={splitExpenses} addSplitExpense={addSplitExpense} />;
      case 'profile':      return <ProfileView user={user} transactions={transactions} goals={goals} categories={categories} onLogout={handleLogout} onUpdateName={handleUpdateName} />;
      default:             return null;
    }
  };

  const navActive = { background: '#6366f1', color: '#fff' };
  const navBase   = { color: '#64748b', background: 'transparent' };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f8fafc', fontFamily:'Inter,sans-serif' }}>

      {/* ── Sidebar (desktop) ─────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        zIndex: 20,
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ height:60, display:'flex', alignItems:'center', padding:'0 14px', borderBottom:'1px solid #e2e8f0', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, flexShrink:0 }}>B</div>
          {sidebarOpen && <span style={{ fontWeight:800, fontSize:15, color:'#1e293b', whiteSpace:'nowrap' }}>BudgetFlow</span>}
        </div>

        {/* Toggle */}
        <button onClick={() => setSidebarOpen(p => !p)} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'10px', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', borderBottom:'1px solid #e2e8f0' }}>
          {sidebarOpen ? <X size={16}/> : <Menu size={16}/>}
        </button>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setPage(key)} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer',
              width:'100%', whiteSpace:'nowrap',
              transition:'all 0.15s',
              ...(page === key ? navActive : navBase),
            }}>
              <Icon size={18} style={{ flexShrink:0 }}/>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Install PWA */}
        {showInstall && (
          <button onClick={handleInstall} style={{ margin:8, padding:'8px', borderRadius:10, border:'1px solid #e2e8f0', background:'#f0fdf4', color:'#16a34a', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Download size={13}/> {sidebarOpen && 'Install App'}
          </button>
        )}
      </aside>

      {/* ── Mobile overlay sidebar ────────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:40 }} className="md:hidden">
          <div onClick={() => setSidebarOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }}/>
          <aside style={{ position:'absolute', left:0, top:0, bottom:0, width:220, background:'#fff', display:'flex', flexDirection:'column', padding:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ fontWeight:800, fontSize:16, color:'#1e293b' }}>BudgetFlow</span>
              <button onClick={() => setSidebarOpen(false)} style={{ border:'none', background:'none', cursor:'pointer', color:'#64748b' }}><X size={18}/></button>
            </div>
            {NAV.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setPage(key); setSidebarOpen(false); }} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 14px', borderRadius:10, border:'none', cursor:'pointer',
                marginBottom:2, textAlign:'left',
                ...(page === key ? navActive : navBase),
              }}>
                <Icon size={18}/> <span style={{ fontSize:14, fontWeight:600 }}>{label}</span>
              </button>
            ))}
          </aside>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Top bar */}
        <header style={{ height:60, background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(p => !p)} className="md:hidden" style={{ border:'none', background:'none', cursor:'pointer', color:'#64748b', padding:4 }}>
            <Menu size={20}/>
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize:16, fontWeight:700, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {NAV.find(n => n.key === page)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {showInstall && (
              <button onClick={handleInstall} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 10px', borderRadius:8, border:'1px solid #dcfce7', background:'#f0fdf4', color:'#16a34a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <Download size={13}/> Install
              </button>
            )}
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>
              {(user.name || user.email || 'U').slice(0,1).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'20px 16px 100px', maxWidth:1100, margin:'0 auto', width:'100%' }}>
          {renderPage()}
        </main>

        {/* ── Bottom nav (mobile) ───────────────────────────────────────── */}
        <nav className="md:hidden" style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #e2e8f0', display:'flex', zIndex:30, paddingBottom:'env(safe-area-inset-bottom)' }}>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setPage(key)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'8px 2px', border:'none', background:'none', cursor:'pointer',
              color: page === key ? '#6366f1' : '#94a3b8',
              gap:2,
            }}>
              <Icon size={20}/>
              <span style={{ fontSize:9, fontWeight:600 }}>{label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* AI Chat */}
      <AIChatBot transactions={transactions} categories={categories} goals={goals} />
    </div>
  );
}
