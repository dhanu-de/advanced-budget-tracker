// Logic for Dashboard calculations. Placed in 'services' as it acts as a local backend utility.

// Aggregates totals (income, expense, balance) and category breakdown
export const aggregateTransactions = (transactions, categories) => {
    const totals = { income: 0, expense: 0 };
    const categoryBreakdown = {};

    transactions.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const type = cat ? cat.type : t.type;

        if (type === 'income') {
            totals.income += t.amount;
        } else if (type === 'expense') {
            totals.expense += t.amount;
        }

        const categoryName = cat ? cat.name : 'Uncategorized';
        categoryBreakdown[categoryName] = (categoryBreakdown[categoryName] || 0) + t.amount;
    });

    totals.balance = totals.income - totals.expense;
    return { totals, categoryBreakdown };
};

// SIMULATED AUTOMATION: Detects subscriptions based on recurring patterns
export const detectSubscriptions = (transactions) => {
    const counts = {};
    transactions.forEach(t => {
        const key = `${t.description.substring(0, 5)}-${t.amount}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts)
        .filter(key => counts[key] >= 3) // Flag if the same transaction occurred 3 or more times
        .map(key => {
            const [descPrefix, amount] = key.split('-');
            return { key, description: `${descPrefix} recurring...`, amount: parseFloat(amount), count: counts[key] };
        });
};