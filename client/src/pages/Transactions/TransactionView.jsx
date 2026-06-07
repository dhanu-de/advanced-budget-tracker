import React, { useState, useRef } from 'react';
import { Upload, Plus, Edit2, Trash2 } from 'lucide-react';
import TransactionForm from '../../components/forms/TransactionForm';

const TransactionView = ({ transactions, categories, addTransaction, deleteTransaction }) => {
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fileInputRef = useRef(null);

  const filteredTransactions = transactions.filter((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    if (filterType === 'all') return true;
    if (filterType === 'income') return cat && cat.type === 'income';
    if (filterType === 'expense') return cat && cat.type === 'expense';
    return true;
  });

  const handleCSVUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return;
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idxDate = header.findIndex(h => ['date','transaction date'].includes(h));
    const idxDesc = header.findIndex(h => ['description','details','memo'].includes(h));
    const idxAmount = header.findIndex(h => ['amount','amt','value'].includes(h));
    const idxCategory = header.findIndex(h => ['category'].includes(h));
    const otherCatId = categories.find(c => c.name.toLowerCase() === 'others')?.id || categories[0]?.id;
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      const cols = [];
      let cur = '';
      let inQ = false;
      for (let j = 0; j < raw.length; j++) {
        const ch = raw[j];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue; }
        cur += ch;
      }
      cols.push(cur);
      const date = idxDate >= 0 ? cols[idxDate]?.trim() : '';
      const description = idxDesc >= 0 ? cols[idxDesc]?.trim() : '';
      const amountStr = idxAmount >= 0 ? cols[idxAmount]?.trim() : '';
      const categoryName = idxCategory >= 0 ? cols[idxCategory]?.trim() : '';
      const amt = parseFloat((amountStr || '').replace(/[^0-9.-]/g, ''));
      if (!description || isNaN(amt)) continue;
      let catId = otherCatId;
      if (categoryName) {
        const match = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (match) catId = match.id;
      } else {
        const d = description.toLowerCase();
        if (d.includes('salary') || d.includes('client')) catId = categories.find(c => c.name === 'Salary')?.id || catId;
        else if (d.includes('rent')) catId = categories.find(c => c.name === 'Rent')?.id || catId;
        else if (d.includes('food') || d.includes('pizza') || d.includes('dinner')) catId = categories.find(c => c.name === 'Food')?.id || catId;
        else if (d.includes('amazon') || d.includes('prime') || d.includes('netflix')) catId = categories.find(c => c.name === 'Entertainment')?.id || catId;
      }
      await addTransaction({ amount: amt, description, date: date || new Date().toISOString().split('T')[0], categoryId: catId, notes: 'Imported from CSV' });
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Transaction History</h2>
        <div className="flex space-x-3">
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVUpload} />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex items-center px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Bank File (CSV)
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* ADD TRANSACTION FORM */}
      {showForm && (
        <TransactionForm
          categories={categories}
          addTransaction={addTransaction}
          onClose={() => setShowForm(false)}
        />
      )}



      {/* FILTER BAR */}
      <div className="flex space-x-3 text-sm font-medium">
        {['all', 'income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full capitalize transition-colors ${
              filterType === type
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={`Show ${type} transactions`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description/Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const isIncome = category?.type === 'income';

              // Date handling: robust formatting
              let formattedDate = '';
              try {
                if (t.date instanceof Date) {
                  formattedDate = t.date.toLocaleDateString();
                } else if (typeof t.date === 'string' || typeof t.date === 'number') {
                  formattedDate = new Date(t.date).toLocaleDateString();
                } else if (t.date && typeof t.date.toDate === 'function') {
                  formattedDate = t.date.toDate().toLocaleDateString();
                } else {
                  formattedDate = '-';
                }
              } catch {
                formattedDate = '-';
              }

              return (
                <tr key={t.id || t.description + t.date} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.description}
                    <p className="text-xs text-gray-500 italic mt-1">
                      Note: {t.notes || 'No note added'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isIncome
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {category ? category.name : 'Unknown'}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} ₹{Number(t.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button
                      title="Edit"
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Edit transaction"
                      disabled
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      title="Delete"
                      aria-label="Delete transaction"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <p className="p-6 text-center text-gray-500 italic">
            No transactions found for this filter. Start adding your financial data!
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionView;
