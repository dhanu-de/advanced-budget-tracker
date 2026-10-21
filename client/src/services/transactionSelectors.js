/**
 * transactionSelectors.js
 * ────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all financial calculations.
 * Both 2D charts and 3D visualisations must import from here — never duplicate logic.
 *
 * Each transaction may carry:
 *   - categoryId  (Number)  — set by the form (numeric id)
 *   - category    (String)  — human name, e.g. "Food"
 *   - type        (String)  — "income" | "expense" (fallback when neither above resolves)
 *
 * resolveCategory() tries every strategy so legacy records still work.
 */

// ── resolveCategory ───────────────────────────────────────────────────────────
/**
 * Return the matching category object for a transaction, or null.
 * Strategy:
 *  1. Match by numeric id  (t.categoryId === c.id)
 *  2. Match by string name (t.category   === c.name)   — case-insensitive
 */
export function resolveCategory(t, categories) {
  if (!categories?.length) return null;

  // Strategy 1: numeric id
  if (t.categoryId != null) {
    const byId = categories.find(c => c.id === Number(t.categoryId));
    if (byId) return byId;
  }

  // Strategy 2: string name
  if (t.category) {
    const name = t.category.trim().toLowerCase();
    const byName = categories.find(c => c.name.trim().toLowerCase() === name);
    if (byName) return byName;
  }

  return null;
}

// ── resolveType ───────────────────────────────────────────────────────────────
/**
 * Return "income" | "expense" for a transaction.
 * Prefers the resolved category type over the stored t.type field.
 */
export function resolveType(t, categories) {
  const cat = resolveCategory(t, categories);
  if (cat?.type === 'income' || cat?.type === 'expense') return cat.type;
  if (t.type === 'income' || t.type === 'expense') return t.type;
  return 'expense'; // safe default
}

// ── aggregateTransactions ─────────────────────────────────────────────────────
/**
 * Returns:
 *   totals: { income, expense, balance }
 *   categoryBreakdown: { [categoryName]: totalAmount }   (only expenses)
 *   incomeBreakdown:   { [categoryName]: totalAmount }   (only income)
 */
export function aggregateTransactions(transactions, categories) {
  const totals = { income: 0, expense: 0 };
  const categoryBreakdown = {};  // expense buckets
  const incomeBreakdown   = {};  // income buckets

  for (const t of transactions) {
    const cat  = resolveCategory(t, categories);
    const type = resolveType(t, categories);
    const amt  = Math.abs(Number(t.amount) || 0);
    const name = cat?.name || t.category || 'Others';

    if (type === 'income') {
      totals.income += amt;
      incomeBreakdown[name] = (incomeBreakdown[name] || 0) + amt;
    } else {
      totals.expense += amt;
      categoryBreakdown[name] = (categoryBreakdown[name] || 0) + amt;
    }
  }

  totals.balance = totals.income - totals.expense;
  return { totals, categoryBreakdown, incomeBreakdown };
}

// ── detectSubscriptions ───────────────────────────────────────────────────────
/**
 * Flags transactions that repeat ≥3 times with the same description prefix + amount.
 */
export function detectSubscriptions(transactions) {
  const counts = {};
  for (const t of transactions) {
    const desc = (t.description || t.title || '').substring(0, 5);
    const key  = `${desc}-${t.amount}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, n]) => n >= 3)
    .map(([key, count]) => {
      const [descPrefix, amount] = key.split('-');
      return { key, description: `${descPrefix}… (recurring)`, amount: parseFloat(amount), count };
    });
}

// ── buildMonthlyTimeline ──────────────────────────────────────────────────────
/**
 * Returns an array of monthly buckets sorted chronologically:
 *   [{ label: "Oct '26", key: "2026-10", income, expense, net }, …]
 *
 * Used by both the 2D NetFlowGraph and the 3D bar timeline.
 */
export function buildMonthlyTimeline(transactions, categories) {
  const buckets = {};

  for (const t of transactions) {
    const dateObj = t.date instanceof Date ? t.date : new Date(t.date);
    if (isNaN(dateObj)) continue;

    const year  = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-indexed
    const key   = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!buckets[key]) buckets[key] = { key, income: 0, expense: 0 };

    const type = resolveType(t, categories);
    const amt  = Math.abs(Number(t.amount) || 0);

    if (type === 'income')  buckets[key].income  += amt;
    else                    buckets[key].expense += amt;
  }

  return Object.values(buckets)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(b => ({
      ...b,
      net:   b.income - b.expense,
      label: (() => {
        const [y, m] = b.key.split('-').map(Number);
        return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      })(),
    }));
}

// ── buildWeeklyTimeline ───────────────────────────────────────────────────────
/**
 * Returns weekly buckets for the last N days.
 */
export function buildWeeklyTimeline(transactions, categories, days = 30) {
  const cutoff = Date.now() - days * 864e5;
  const buckets = {};

  for (const t of transactions) {
    const dateObj = t.date instanceof Date ? t.date : new Date(t.date);
    if (isNaN(dateObj) || dateObj.getTime() < cutoff) continue;

    // ISO week key: YYYY-Www
    const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const week = Math.ceil(((dateObj - startOfYear) / 864e5 + startOfYear.getDay() + 1) / 7);
    const key  = `${dateObj.getFullYear()}-W${String(week).padStart(2, '0')}`;

    if (!buckets[key]) buckets[key] = { key, income: 0, expense: 0, label: `W${week}` };

    const type = resolveType(t, categories);
    const amt  = Math.abs(Number(t.amount) || 0);
    if (type === 'income') buckets[key].income  += amt;
    else                   buckets[key].expense += amt;
  }

  return Object.values(buckets)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(b => ({ ...b, net: b.income - b.expense }));
}

// ── getSavingsRate ────────────────────────────────────────────────────────────
/**
 * Returns a 0–1 savings rate.
 *   > 0.4  → healthy (green)
 *   0.1–0.4 → caution (amber)
 *   < 0.1  → overspending (red)
 */
export function getSavingsRate(totals) {
  const { income = 0, expense = 0 } = totals;
  if (income <= 0) return expense > 0 ? 0 : 0.5; // no data → neutral
  return Math.max(0, Math.min(1, (income - expense) / income));
}

// ── filterByRange ─────────────────────────────────────────────────────────────
/**
 * Filter transactions to a time range.
 * @param {string} range - "7D" | "30D" | "90D" | "1Y"
 */
export function filterByRange(transactions, range) {
  const msMap = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 };
  const days  = msMap[range] ?? 30;
  const cutoff = Date.now() - days * 864e5;
  return transactions.filter(t => {
    const d = t.date instanceof Date ? t.date : new Date(t.date);
    return !isNaN(d) && d.getTime() >= cutoff;
  });
}
