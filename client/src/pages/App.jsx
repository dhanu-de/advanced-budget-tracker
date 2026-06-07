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
} from '../services/firebaseService';
import SignInPage from './Auth/SignInPage';
import Dashboard from './Dashboard/Dashboard';
import TransactionView from './Transactions/TransactionView';
import GoalsView from './Goals/GoalsView';
import SplitBillView from './Split/SplitBillView';
import GroupSplitView from './Split/GroupSplitView';
import ProfileView from './Profile/ProfileView';
import AIChatBot from '../components/shared/AIChatBot';
import {
  LayoutDashboard, ArrowLeftRight, Target,
  Scissors, Users, UserCircle, Menu, X, Download
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Salary',        type: 'income',  color: '#10B981' },
  { id: 2, name: 'Rent',          type: 'expense', color: '#EF4444' },
  { id: 3, name: 'Food',          type: 'expense', color: '#F59E0B' },
  { id: 4, name: 'Entertainment', type: 'expense', color: '#8B5CF6' },
  { id: 5, name: 'Savings',       type: 'expense', color: '#3B82F6' },
  { id: 6, name: 'Others',        type: 'expense', color: '#374151' },
];

const NAV_ITEMS = [
  { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { key: 'goals',        label: 'Goals',        icon: Target          },
  { key: 'split',        label: 'Split',        icon: Scissors        },
  { key: 'group-split',  label: 'Group',        icon: Users           },
  { key: 'profile',      label: 'Profile',      icon: UserCircle      },
];

export default function App() {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [currentPage,   setCurrentPage]   = useState('dashboard');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [transactions,  setTransactions]  = useState([]);
  const [goals,         setGoals]         = useState([]);
  const [memos,         setMemos]         = useState([]);
  const [splitExpenses, setSplitExpenses] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall,   setShowInstall]   = useState(false);

  const categories = DEFAULT_CATEGORIES;

  // ── PWA install prompt ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  // ── Load data from localStorage ────────────────────────────────────────────
  const loadData = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const [txs, gls] = await Promise.all([
        getTransactionsAPI(userId),
        getGoalsAPI(userId),
      ]);
      setTransactions(txs);
      setGoals(gls);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  // ── Auth: check localStorage session on startup ────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await loadData(authUser.id);
      } else {
        setUser(null);
        setTransactions([]);
        setGoals([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadData]);

  const handleLogin = (userData) => {
    setUser(userData);
    loadData(userData.id);
  };

  const handleLogout = () => {
    doLogout();
    setUser(null);
    setTransactions([]);
    setGoals([]);
  };

  const handleUpdateName = (name) => setUser(prev => ({ ...prev, name }));

  // ── Transaction ops ────────────────────────────────────────────────────────
  const addTransaction = async (data) => {
    if (!user) return false;
    try {
      const saved = await addTransactionAPI(user.id, {
        title:    data.description || data.title || 'Transaction',
        description: data.description || data.title,
        amount:   data.amount,
        category: data.category || 'Others',
        type:     data.type     || 'expense',
        notes:    data.notes    || '',
        date:     data.date     || new Date().toISOString(),
      });
      setTransactions(prev => [saved, ...prev]);
      return true;
    } catch (err) {
      console.error('addTransaction failed:', err);
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteTransactionAPI(user.id, id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('deleteTransaction failed:', err);
    }
  };

  // ── Goal ops ───────────────────────────────────────────────────────────────
  const addGoal = async (goalData) => {
    if (!user) return;
    try {
      const saved = await addGoalAPI(user.id, {
        title:      goalData.title,
        target:     parseFloat(goalData.target) || 0,
        targetDate: goalData.targetDate || '',
      });
      setGoals(prev => [saved, ...prev]);
    } catch (err) {
      console.error('addGoal failed:', err);
    }
  };

  const contributeToGoal = async (goalId, amount) => {
    if (!user) return;
    try {
      await contributeGoalAPI(user.id, goalId, amount);
      setGoals(prev => prev.map(g =>
        g.id === goalId ? { ...g, saved: Number(g.saved || 0) + Number(amount) } : g
      ));
      await addTransaction({
        title: 'Goal Contribution', description: 'Goal Contribution',
        amount: parseFloat(amount), type: 'expense',
        category: 'Savings', date: new Date().toISOString(),
      });
    } catch (err) {
      console.error('contributeToGoal failed:', err);
    }
  };

  const addMemo = (memoData) =>
    setMemos(prev => [...prev, { id: Date.now(), ...memoData }]);

  const addSplitExpense = (payload) =>
    setSplitExpenses(prev => [...prev, {
      id: Date.now(),
      description:       payload.description,
      totalAmount:       Number(payload.totalAmount),
      totalParticipants: Number(payload.totalParticipants),
    }]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-2xl">
          BF
        </div>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium">Loading BudgetFlow…</p>
      </div>
    );
  }

  if (!user) return <SignInPage onLogin={handleLogin} />;

  const getInitials = (name, email) => {
    if (name?.trim()) return name.trim().slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'BF';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard transactions={transactions} categories={categories} goals={goals} memos={memos} />;
      case 'transactions': return <TransactionView transactions={transactions} categories={categories} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />;
      case 'goals':        return <GoalsView goals={goals} memos={memos} addMemo={addMemo} addGoal={addGoal} contributeToGoal={contributeToGoal} categories={categories} />;
      case 'split':        return <SplitBillView categories={categories} addTransaction={addTransaction} />;
      case 'group-split':  return <GroupSplitView splitExpenses={splitExpenses} addSplitExpense={addSplitExpense} />;
      case 'profile':      return <ProfileView user={user} transactions={transactions} goals={goals} categories={categories} onLogout={handleLogout} onUpdateName={handleUpdateName} />;
      default:             return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col ${sidebarOpen ? 'w-60' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-[width] duration-200 shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">BF</div>
            {sidebarOpen && <span className="font-bold text-white truncate">BudgetFlow</span>}
          </div>
          <button onClick={() => setSidebarOpen(p => !p)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                currentPage === key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button onClick={() => setCurrentPage('profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user.name, user.email)}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden text-left">
                <p className="text-white text-sm font-medium truncate">{user.name || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">BF</div>
            <span className="font-bold text-white text-sm">BudgetFlow</span>
          </div>
          <button onClick={() => setCurrentPage('profile')} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
            {getInitials(user.name, user.email)}
          </button>
        </header>

        {/* PWA install banner */}
        {showInstall && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-900/60 border-b border-emerald-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-emerald-200 text-sm truncate">Install BudgetFlow on your phone!</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleInstall} className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg transition-colors">Install</button>
              <button onClick={() => setShowInstall(false)} className="text-xs text-gray-400 hover:text-white px-2">✕</button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          {renderPage()}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all min-w-0 ${
                currentPage === key ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${currentPage === key ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium leading-none truncate">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AIChatBot transactions={transactions} categories={categories} goals={goals} />
    </div>
  );
}
