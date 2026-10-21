/**
 * financeUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Re-exports from transactionSelectors.js for backward compatibility.
 * All new code should import directly from transactionSelectors.js.
 */
export {
  resolveCategory,
  resolveType,
  aggregateTransactions,
  detectSubscriptions,
  buildMonthlyTimeline,
  getSavingsRate,
  filterByRange,
} from './transactionSelectors.js';