// ─── API service — calls Express backend ─────────────────────────────────────
// In development: Vite proxy forwards /api → localhost:5000
// In production:  VITE_API_URL points to deployed backend (e.g. https://budgetflow.onrender.com)
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

// ── Token helpers ──────────────────────────────────────────────────────────────
const getToken  = () => localStorage.getItem('bf_token');
const saveToken = (t) => localStorage.setItem('bf_token', t);
const clearToken = () => localStorage.removeItem('bf_token');

// ── HTTP helper ────────────────────────────────────────────────────────────────
async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export const register = async (email, password, name) => {
  const data = await req('POST', '/auth/register', { email, password, name });
  saveToken(data.token);
  return data.user;
};

export const login = async (email, password) => {
  const data = await req('POST', '/auth/login', { email, password });
  saveToken(data.token);
  return data.user;
};

export const guest = async () => {
  const data = await req('POST', '/auth/guest');
  saveToken(data.token);
  return data.user;
};

export const logout = () => clearToken();

// Called on app startup to restore session from saved token
export const onAuthChange = (callback) => {
  const token = getToken();
  if (!token) {
    callback(null);
    return () => {};   // no-op unsubscribe
  }

  req('GET', '/auth/me')
    .then(data => callback(data.user))
    .catch(() => {
      clearToken();
      callback(null);
    });

  return () => {};   // no-op unsubscribe
};

// ── Transactions ───────────────────────────────────────────────────────────────
export const addTransaction = async (_uid, tx) => {
  const data = await req('POST', '/transactions', {
    title:    tx.title || tx.description || 'Transaction',
    amount:   tx.amount,
    category: tx.category || 'Others',
    type:     tx.type || 'expense',
    notes:    tx.notes || '',
    date:     tx.date  || new Date().toISOString(),
  });
  const saved = data.data;
  return { ...saved, description: saved.title };
};

export const getTransactions = async (_uid) => {
  const txs = await req('GET', '/transactions');
  return txs.map(t => ({ ...t, description: t.title }));
};

export const deleteTransaction = async (id) => {
  await req('DELETE', `/transactions/${id}`);
};

// ── Goals ──────────────────────────────────────────────────────────────────────
export const addGoal = async (_uid, goal) => {
  const data = await req('POST', '/goals', {
    title:      goal.title,
    target:     parseFloat(goal.target) || 0,
    targetDate: goal.targetDate || '',
  });
  return data.data;
};

export const getGoals = async (_uid) => {
  return await req('GET', '/goals');
};

export const deleteGoal = async (id) => {
  await req('DELETE', `/goals/${id}`);
};

export const contributeGoal = async (id, amount) => {
  const data = await req('PATCH', `/goals/${id}/contribute`, { amount });
  return data.data;
};
