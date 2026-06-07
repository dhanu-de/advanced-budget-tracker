// ─── BudgetFlow Local Storage Service ────────────────────────────────────────
// All data stored in browser localStorage — works on GitHub Pages with no backend.
// Data persists per device/browser.

// ── Storage helpers ───────────────────────────────────────────────────────────
const get  = (key, fallback = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const set  = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ── Auth keys ─────────────────────────────────────────────────────────────────
const CURRENT_USER_KEY = 'bf_current_user';
const USERS_KEY        = 'bf_users';

// ── User helpers ──────────────────────────────────────────────────────────────
const getUsers   = ()       => get(USERS_KEY, []);
const saveUsers  = (users)  => set(USERS_KEY, users);
const getSession = ()       => get(CURRENT_USER_KEY, null);
const saveSession= (user)   => set(CURRENT_USER_KEY, user);
const clearSession = ()     => localStorage.removeItem(CURRENT_USER_KEY);

// Simple hash using btoa (not cryptographic, good enough for local demo)
const hashPw = (pw) => btoa(encodeURIComponent(pw + '_bf_salt_2024'));

// ── Auth ───────────────────────────────────────────────────────────────────────
export const register = async (email, password, name) => {
  const users = getUsers();
  if (users.find(u => u.email === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const user = {
    id:        uid(),
    email:     email.toLowerCase(),
    password:  hashPw(password),
    name:      name || email.split('@')[0],
    isGuest:   false,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  const session = { id: user.id, email: user.email, name: user.name, isGuest: false, createdAt: user.createdAt };
  saveSession(session);
  return session;
};

export const login = async (email, password) => {
  const users = getUsers();
  const user  = users.find(u => u.email === email?.toLowerCase());
  if (!user || user.isGuest || user.password !== hashPw(password)) {
    throw new Error('Invalid email or password');
  }
  const session = { id: user.id, email: user.email, name: user.name, isGuest: false, createdAt: user.createdAt };
  saveSession(session);
  return session;
};

export const guest = async () => {
  const session = {
    id:        uid(),
    email:     `guest_${Date.now()}@local`,
    name:      'Guest User',
    isGuest:   true,
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
};

export const logout = () => clearSession();

export const onAuthChange = (callback) => {
  const session = getSession();
  // Call async so React state updates correctly
  setTimeout(() => callback(session), 0);
  return () => {};  // no-op unsubscribe
};

// ── Data keys per user ────────────────────────────────────────────────────────
const txKey   = (uid) => `bf_tx_${uid}`;
const goalKey = (uid) => `bf_goal_${uid}`;

// ── Transactions ───────────────────────────────────────────────────────────────
export const getTransactions = async (userId) => {
  const txs = get(txKey(userId), []);
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(t => ({ ...t, description: t.title }));
};

export const addTransaction = async (userId, tx) => {
  const txs = get(txKey(userId), []);
  const saved = {
    id:       uid(),
    userId,
    title:    tx.title || tx.description || 'Transaction',
    amount:   Number(tx.amount),
    category: tx.category || 'Others',
    type:     tx.type     || 'expense',
    notes:    tx.notes    || '',
    date:     tx.date     || new Date().toISOString(),
  };
  set(txKey(userId), [saved, ...txs]);
  return { ...saved, description: saved.title };
};

export const deleteTransaction = async (userId, id) => {
  const txs = get(txKey(userId), []);
  set(txKey(userId), txs.filter(t => t.id !== id));
};

// ── Goals ──────────────────────────────────────────────────────────────────────
export const getGoals = async (userId) => {
  const goals = get(goalKey(userId), []);
  return goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const addGoal = async (userId, goal) => {
  const goals = get(goalKey(userId), []);
  const saved = {
    id:         uid(),
    userId,
    title:      goal.title,
    target:     parseFloat(goal.target) || 0,
    saved:      0,
    targetDate: goal.targetDate || '',
    createdAt:  new Date().toISOString(),
  };
  set(goalKey(userId), [saved, ...goals]);
  return saved;
};

export const deleteGoal = async (userId, id) => {
  const goals = get(goalKey(userId), []);
  set(goalKey(userId), goals.filter(g => g.id !== id));
};

export const contributeGoal = async (userId, id, amount) => {
  const goals = get(goalKey(userId), []);
  const updated = goals.map(g =>
    g.id === id ? { ...g, saved: Number(g.saved) + Number(amount) } : g
  );
  set(goalKey(userId), updated);
  return updated.find(g => g.id === id);
};
