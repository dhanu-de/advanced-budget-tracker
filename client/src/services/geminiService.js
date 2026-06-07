// Groq AI Service — OpenAI-compatible, blazing fast, generous free tier
// Free tier: 30 req/min, 14,400 req/day on llama-3.3-70b-versatile
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const PLACEHOLDER = 'your_groq_api_key_here';

/**
 * Build a rich financial context string from app data
 */
export const buildFinancialContext = (transactions, categories, goals) => {
    const totalIncome = transactions
        .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
        .filter(t => categories.find(c => c.id === t.categoryId)?.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    const categoryBreakdown = {};
    transactions.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        if (cat) {
            categoryBreakdown[cat.name] = (categoryBreakdown[cat.name] || 0) + Number(t.amount);
        }
    });

    const categoryStr = Object.entries(categoryBreakdown)
        .map(([name, amt]) => `  - ${name}: ₹${amt.toFixed(2)}`)
        .join('\n') || '  - No transactions yet';

    const goalsStr = goals
        .map(g => `  - ${g.title}: saved ₹${g.saved.toFixed(2)} of ₹${g.target.toFixed(2)} (${Math.min(100, ((g.saved / g.target) * 100)).toFixed(1)}%)`)
        .join('\n') || '  - No goals set yet';

    return `USER'S FINANCIAL DATA:
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpense.toFixed(2)}
- Net Balance: ₹${balance.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Total Transactions: ${transactions.length}

SPENDING BY CATEGORY:
${categoryStr}

FINANCIAL GOALS:
${goalsStr}`;
};

/**
 * Send a message to Groq (OpenAI-compatible API)
 */
export const sendMessageToGemini = async (userMessage, financialContext, chatHistory = []) => {
    const key = import.meta.env.VITE_GROQ_API_KEY;

    if (!key || key === PLACEHOLDER) {
        return "🔑 **API key not configured!**\n\nAdd your Groq key to the `.env` file as:\n`VITE_GROQ_API_KEY=gsk_...`\n\nGet a free key at: https://console.groq.com/keys";
    }

    const systemPrompt = `You are BudgetFlow AI, a brilliant and friendly personal finance advisor embedded inside a budget tracking app.
You have access to the user's real financial data below. Use it to give hyper-personalized, specific, and actionable advice.
Be warm, encouraging, and concise (under 200 words unless asked for more).
Always use Indian Rupees (₹). Give India-specific advice: mention SIP, PPF, NPS, ELSS, FD, Nifty 50, etc. when relevant.
If the user asks a general finance question, still reference their actual numbers where helpful.

${financialContext}`;

    // Build OpenAI-format messages
    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text,
        })),
        { role: 'user', content: userMessage },
    ];

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 512,
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || response.statusText;

            if (response.status === 401) {
                return "❌ **Invalid Groq API key!**\n\nPlease check your `VITE_GROQ_API_KEY` in `.env` and restart the server.";
            }
            if (response.status === 429) {
                return "QUOTA_EXCEEDED:30";
            }
            return `⚠️ Error (${response.status}): ${errMsg}`;
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        return text || "🤔 I received an empty response. Please try again.";

    } catch (error) {
        console.error('Groq fetch error:', error);
        return "🌐 **Network error.** Please check your internet connection and try again.";
    }
};
