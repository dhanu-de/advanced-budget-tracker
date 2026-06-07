import React, { useState, useMemo } from 'react';
import { Users, ArrowUp, GitMerge, Plus } from 'lucide-react';
import { StatCard } from '../../components/shared/SharedUI';

const InlineGroupExpenseForm = ({ onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalParticipants, setTotalParticipants] = useState(2);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(totalAmount);
    const ppl = parseInt(totalParticipants, 10);
    if (!description || isNaN(amt) || amt <= 0 || isNaN(ppl) || ppl < 2) {
      setError('Enter description, amount (>0) and at least 2 participants');
      return;
    }
    onSave({ description, totalAmount: amt, totalParticipants: ppl });
    onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Amount</label>
          <input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Participants</label>
          <input type="number" min={2} value={totalParticipants} onChange={(e) => setTotalParticipants(e.target.value)} className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
        <button type="submit" className="px-3 py-2 rounded bg-primary text-white">Save</button>
      </div>
    </form>
  );
};

const GroupSplitView = ({ splitExpenses = [], addSplitExpense }) => {
  const [showForm, setShowForm] = useState(false);

  const calculateBalances = (expenses) => {
    let totalOwedToUser = 0;
    expenses.forEach(exp => {
      const splitPerPerson = exp.totalAmount / exp.totalParticipants;
      const totalOwedByFriends = exp.totalAmount - splitPerPerson;
      totalOwedToUser += totalOwedByFriends;
    });
    return { totalOwedToUser, netBalance: totalOwedToUser };
  };

  const balances = useMemo(() => calculateBalances(splitExpenses), [splitExpenses]);

  const handleSave = (payload) => {
    addSplitExpense(payload);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center text-indigo-600 dark:text-indigo-400">
        <Users className='w-7 h-7 mr-2' /> Group Expense Splitter
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Owed TO YOU" value={balances.totalOwedToUser} icon={ArrowUp} color="#10B981" trend={0} />
        <StatCard title="Net Split Balance" value={balances.netBalance} icon={GitMerge} color="#6366F1" trend={0} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Trip History (You Paid)</h3>
          <button onClick={() => setShowForm(true)} className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md text-sm">
            <Plus className="w-4 h-4 mr-1" /> Log New Group Expense
          </button>
        </div>

        {showForm && (
          <InlineGroupExpenseForm onSave={handleSave} onClose={() => setShowForm(false)} />
        )}

        <div className="space-y-3 pt-3">
          {splitExpenses.map((exp) => {
            const splitAmount = exp.totalAmount / exp.totalParticipants;
            const owedToUser = exp.totalAmount - splitAmount;
            return (
              <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold">{exp.description}</span>
                  <span className='text-sm font-bold text-indigo-600'>₹{Number(exp.totalAmount).toFixed(2)} Paid</span>
                </div>
                <p className="text-sm mt-1 text-gray-500">Participants: {exp.totalParticipants} people (You + {exp.totalParticipants - 1} friends)</p>
                <div className='mt-2'>
                  <p className='text-green-600 font-medium'>Each friend owes: ₹{splitAmount.toFixed(2)}</p>
                  <p className='sm'>Total owed to you: <span className='font-bold text-green-700'>₹{owedToUser.toFixed(2)}</span></p>
                </div>
              </div>
            );
          })}
          {splitExpenses.length === 0 && <p className='text-gray-500 italic'>No group expenses logged yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default GroupSplitView;