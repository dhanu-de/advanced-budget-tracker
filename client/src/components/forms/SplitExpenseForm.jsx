import React, { useState } from 'react';

const SplitExpenseForm = ({ categories = [], addTransaction, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [names, setNames] = useState(['Person 1', 'Person 2']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateCount = (count) => {
    const n = Math.max(2, Math.min(20, Number(count) || 2));
    setPeopleCount(n);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(`Person ${next.length + 1}`);
      return next.slice(0, n);
    });
  };

  const updateName = (i, val) => {
    setNames((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || !description || !date || !categoryId) {
      setError('Please fill all required fields');
      return;
    }
    const total = Number(amount);
    if (isNaN(total) || total <= 0) {
      setError('Enter a valid amount');
      return;
    }
    const each = Number((total / peopleCount).toFixed(2));
    const adjust = Number((total - each * peopleCount).toFixed(2));
    setSubmitting(true);
    try {
      for (let i = 0; i < peopleCount; i++) {
        const portion = i === 0 ? each + adjust : each;
        await addTransaction({
          amount: portion,
          description: `${description} (Split: ${names[i]})`,
          date,
          categoryId: Number(categoryId),
          notes: `Split bill among ${peopleCount}`,
        });
      }
      onClose && onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Split Bill</h3>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" placeholder="e.g. Dinner at ABC" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" required>
                <option value="" disabled>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of People</label>
              <input type="number" min="2" max="20" value={peopleCount} onChange={(e) => updateCount(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: peopleCount }).map((_, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-1">Person {i + 1} Name</label>
                <input type="text" value={names[i] || ''} onChange={(e) => updateName(i, e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60">{submitting ? 'Splitting...' : 'Split'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitExpenseForm;