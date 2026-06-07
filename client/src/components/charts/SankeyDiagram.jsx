import React from 'react';

const SankeyDiagramSimulation = ({ totals = {}, goals = [] }) => {
    const totalIncome = Number(totals.income) || 0;
    const totalExpense = Number(totals.expense) || 0;
    const totalSavings = goals.reduce((sum, g) => sum + (Number(g.saved) || 0), 0);
    const balance = Number(totals.balance) || 0;

    const links = [
        { source: 'Income', target: 'Expenses', value: totalExpense, color: 'red' },
        { source: 'Income', target: 'Savings', value: totalSavings, color: 'blue' },
        { source: 'Income', target: 'Balance', value: balance > 0 ? balance : 0, color: 'green' },
    ].filter(l => l.value > 0);

    // For rendering links safely
    const findLinkValue = (key) => {
        const item = links.find(l => l.target === key);
        return item ? item.value : 0;
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                A Sankey diagram shows how funds flow from sources (Income) to categories (Expenses) and eventually to destinations (Savings / Balance).
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                    Source: Income (₹{totalIncome.toFixed(2)})
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                    Categories: Expenses (₹{totalExpense.toFixed(2)})
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    Destinations: Net Balance / Goals (₹{(totalSavings + balance).toFixed(2)})
                </div>
            </div>

            <div className="relative h-48 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-400" aria-label="Sankey diagram flow simulation">
                <div className="flex flex-col space-y-2">
                    <div className="text-green-500">
                        Income → Expenses (₹{findLinkValue('Expenses').toFixed(0)})
                    </div>
                    <div className="text-blue-500">
                        Income → Savings (₹{findLinkValue('Savings').toFixed(0)})
                    </div>
                    <div className="text-teal-500">
                        Income → Balance (₹{findLinkValue('Balance').toFixed(0)})
                    </div>
                </div>
                <div className="text-gray-500 italic">
                    Visual Flow requires D3.js or a dedicated chart library.
                </div>
            </div>
        </div>
    );
};

export default SankeyDiagramSimulation;
