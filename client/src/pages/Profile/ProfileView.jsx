import React, { useState } from 'react';
import {
  User, Mail, Edit3, Save, X, TrendingUp, TrendingDown,
  Target, CreditCard, ShieldCheck, LogOut, Trash2, Bell
} from 'lucide-react';

const ProfileView = ({ user, transactions, goals, categories, onLogout, onUpdateName }) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;
  const completedGoals = goals.filter(g => Number(g.saved) >= Number(g.target)).length;

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await onUpdateName(newName.trim());
      setEditing(false);
    } catch {
      // fail silently
    }
    setSaving(false);
  };

  const getInitials = (name, email) => {
    if (name && name.trim()) return name.trim().slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'BF';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently joined';

  const statCards = [
    { label: 'Total Income', value: `₹${totalIncome.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Net Balance', value: `₹${Math.abs(balance).toLocaleString('en-IN')}`, icon: CreditCard, color: balance >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Savings Rate', value: `${savingsRate}%`, icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Transactions', value: transactions.length, icon: CreditCard, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { label: 'Goals Done', value: `${completedGoals}/${goals.length}`, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 space-y-5">

      {/* ── Profile Card ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-900 shadow-xl select-none">
              {getInitials(user?.name, user?.email)}
            </div>
            <button
              onClick={() => { setEditing(true); setNewName(user?.name || ''); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors border border-gray-700"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* Name & email */}
          {editing ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-gray-800 text-white text-xl font-bold rounded-lg px-3 py-1.5 border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your name"
              />
              <button onClick={handleSaveName} disabled={saving}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-white mb-1">{user?.name || 'BudgetFlow User'}</h2>
          )}

          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <User className="w-3 h-3" />
            <span>Member since {memberSince}</span>
            {user?.isGuest && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30">Guest</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Financial Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-xl p-4 border ${bg} flex items-center gap-3`}>
              <div className={`p-2 rounded-lg bg-gray-900/50`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Settings</h3>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800 overflow-hidden">

          {/* Notifications toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white text-sm font-medium">Notifications</p>
                <p className="text-gray-500 text-xs">Budget alerts &amp; reminders</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsOn(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notificationsOn ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notificationsOn ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* App version */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white text-sm font-medium">App Version</p>
                <p className="text-gray-500 text-xs">BudgetFlow v1.0.0 — PWA</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Latest</span>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Account</h3>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800 overflow-hidden">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-white text-sm font-medium">Sign Out</p>
              <p className="text-gray-500 text-xs">Log out of your account</p>
            </div>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition-colors text-left"
            >
              <Trash2 className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-rose-400 text-sm font-medium">Delete Account</p>
                <p className="text-gray-500 text-xs">Permanently remove all your data</p>
              </div>
            </button>
          ) : (
            <div className="px-5 py-4 bg-rose-500/5">
              <p className="text-rose-300 text-sm mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={onLogout}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
