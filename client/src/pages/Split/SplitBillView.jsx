import React, { useState, useMemo } from 'react';

const SplitBillView = ({ categories = [], addTransaction }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [participants, setParticipants] = useState([
    { name: 'Person 1', amount: '' },
    { name: 'Person 2', amount: '' },
  ]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalAssigned = useMemo(() => {
    return participants.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [participants]);

  const addRow = () => {
    setParticipants((prev) => [...prev, { name: `Person ${prev.length + 1}`, amount: '' }]);
  };
  const removeRow = (i) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateRow = (i, key, value) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const equalSplit = () => {
    const total = Number(amount);
    if (!total || total <= 0 || !participants.length) return;
    const each = Number((total / participants.length).toFixed(2));
    const adjust = Number((total - each * participants.length).toFixed(2));
    setParticipants((prev) => prev.map((p, i) => ({ ...p, amount: String(i === 0 ? each + adjust : each) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const total = Number(amount);
    if (!total || total <= 0 || !description || !date || !categoryId) {
      setError('Please fill all required fields');
      return;
    }
    if (participants.length < 2) {
      setError('Add at least two participants');
      return;
    }
    if (Math.abs(totalAssigned - total) > 0.01) {
      setError('Split amounts must sum to total');
      return;
    }
    setSubmitting(true);
    try {
      for (const p of participants) {
        const portion = Number(p.amount) || 0;
        await addTransaction({
          amount: portion,
          description: `${description} (Split: ${p.name})`,
          date,
          categoryId: Number(categoryId),
          notes: `Split bill among ${participants.length}`,
        });
      }
      setAmount('');
      setDescription('');
      setCategoryId('');
      setParticipants([
        { name: 'Person 1', amount: '' },
        { name: 'Person 2', amount: '' },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold">Split Bill</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
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
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assigned: ₹{totalAssigned.toFixed(2)}</p>
              <p className="text-sm font-semibold">Remaining: ₹{(Number(amount || 0) - totalAssigned).toFixed(2)}</p>
            </div>
            <button type="button" onClick={equalSplit} className="px-3 py-2 rounded bg-primary text-white">Equal split</button>
          </div>
        </div>

        <div className="space-y-3">
          {participants.map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={p.name} onChange={(e) => updateRow(i, 'name', e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" step="0.01" value={p.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div className="col-span-2 flex items-end">
                <button type="button" onClick={() => removeRow(i)} className="px-3 py-2 rounded bg-red-600 text-white w-full">Remove</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow} className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700">Add person</button>
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60">{submitting ? 'Saving...' : 'Create split'}</button>
        </div>
      </form>
    </div>
  );
};

export default SplitBillView;