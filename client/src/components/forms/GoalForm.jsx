import React, { useState } from 'react';

const GoalForm = ({ addGoal, onClose }) => {
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title || !target || Number(target) <= 0) {
            setError('Please enter a goal title and a target amount greater than 0');
            return;
        }
        setSubmitting(true);
        try {
            addGoal({ title, target: parseFloat(target), targetDate });
            onClose && onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">New Financial Goal</h3>
                    <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Close</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Goal Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                            placeholder="e.g. Vacation Fund"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                            placeholder="e.g. 100000"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Date (optional)</label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-60">
                            {submitting ? 'Saving...' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalForm;
