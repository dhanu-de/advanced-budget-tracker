/**
 * geminiService.js
 * Uses Google Gemini 2.0 Flash — best free AI model available.
 *
 * Free limits (Google AI Studio key):
 *   • 15 requests / minute
 *   • 1,500 requests / day
 *   • 1,000,000 tokens / day
 *   • NO credit card required
 *
 * Get your free API key at: https://aistudio.google.com/app/apikey
 * Add to .env: VITE_GEMINI_API_KEY=AIza...
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME  = 'gemini-2.0-flash';
const PLACEHOLDER = 'your_gemini_api_key_here';

// ── Build financial context string ────────────────────────────────────────────
export const buildFinancialContext = (transactions = [], categories = [], goals = []) => {
  let income = 0, expense = 0;
  const catBreakdown = {};
  const monthlyMap   = {};

  for (const t of transactions) {
    const cat  = categories.find(c => c.id === t.categoryId || c.name === t.category);
    const type = cat?.type || t.type || 'expense';
    const amt  = Math.abs(Number(t.amount) || 0);
    const name = cat?.name || t.category || 'Others';

    if (type === 'income') income  += amt;
    else                   expense += amt;

    catBreakdown[name] = (catBreakdown[name] || 0) + amt;

    // Monthly bucketing
    const d  = new Date(t.date);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[mk]) monthlyMap[mk] = { income: 0, expense: 0 };
    if (type === 'income') monthlyMap[mk].income  += amt;
    else                   monthlyMap[mk].expense += amt;
  }

  const balance      = income - expense;
  const savingsRate  = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  const catStr = Object.entries(catBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amt]) => `  • ${name}: ₹${amt.toLocaleString('en-IN')}`)
    .join('\n') || '  • No transactions yet';

  const goalsStr = goals.length
    ? goals.map(g => {
        const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100).toFixed(1) : 0;
        return `  • ${g.title}: ₹${Number(g.saved).toLocaleString('en-IN')} saved of ₹${Number(g.target).toLocaleString('en-IN')} (${pct}%)`;
      }).join('\n')
    : '  • No goals set yet';

  const recentStr = transactions.slice(0, 5)
    .map(t => `  • ${t.description || t.title} — ₹${Number(t.amount).toLocaleString('en-IN')} (${t.type})`)
    .join('\n') || '  • No recent transactions';

  return `
USER FINANCIAL SNAPSHOT (BudgetFlow):
──────────────────────────────────────
Total Income  : ₹${income.toLocaleString('en-IN')}
Total Expenses: ₹${expense.toLocaleString('en-IN')}
Net Balance   : ₹${balance.toLocaleString('en-IN')} (${balance >= 0 ? 'SURPLUS' : 'DEFICIT'})
Savings Rate  : ${savingsRate}%
Transactions  : ${transactions.length} total

SPENDING BY CATEGORY:
${catStr}

SAVINGS GOALS:
${goalsStr}

5 MOST RECENT TRANSACTIONS:
${recentStr}
──────────────────────────────────────`.trim();
};

// ── Send message to Gemini 2.0 Flash ──────────────────────────────────────────
export const sendMessageToGemini = async (userMessage, financialContext, chatHistory = []) => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;

  if (!key || key === PLACEHOLDER || key.trim() === '') {
    return [
      '🔑 **Gemini API key not set!**',
      '',
      'To enable AI features:',
      '1. Visit https://aistudio.google.com/app/apikey',
      '2. Click **Create API Key** (100% free, no card needed)',
      '3. Add to your `.env` file:',
      '   `VITE_GEMINI_API_KEY=AIza...`',
      '4. Redeploy or restart the dev server',
    ].join('\n');
  }

  const systemInstruction = `You are BudgetFlow AI — a brilliant, warm, and concise personal finance advisor embedded in a budget tracking app for Indian users.

You have real-time access to the user's financial data (provided below). Use it to give hyper-personalised, specific, and actionable advice.

RULES:
- Always use Indian Rupees (₹) and Indian number formatting (lakhs, crores)
- Give India-specific advice: mention SIP, PPF, NPS, ELSS, FD, RD, Nifty 50, HDFC, SBI, etc. when relevant
- Keep responses under 250 words unless the user asks for more detail
- Be encouraging, empathetic, and non-judgmental
- Reference the user's ACTUAL numbers whenever possible — never give generic advice
- If asked general finance questions, still tie in their real data
- Use bullet points and emojis to keep responses scannable

USER'S CURRENT FINANCIAL DATA:
${financialContext}`;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction,
    });

    // Convert chat history to Gemini format.
    // Gemini requires history to START with a 'user' message — strip any
    // leading 'model' messages (e.g. the initial AI greeting).
    const rawHistory = chatHistory
      .filter(m => m.text && m.text.trim())
      .map(m => ({
        role:  m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

    // Drop leading model turns so the first entry is always 'user'
    while (rawHistory.length > 0 && rawHistory[0].role === 'model') {
      rawHistory.shift();
    }
    const history = rawHistory;

    const chat  = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const text   = result.response.text();

    return text || '🤔 I received an empty response. Please try again.';

  } catch (err) {
    console.error('Gemini error:', err);

    const msg = err.message || '';

    if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
      return '❌ **Invalid API key.** Please check your `VITE_GEMINI_API_KEY` in `.env`.';
    }
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return '⏳ **Rate limit reached.** You\'ve hit the free tier limit (15 req/min). Please wait a minute and try again.';
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return '🌐 **Network error.** Please check your internet connection and try again.';
    }

    return `⚠️ Error: ${msg || 'Something went wrong. Please try again.'}`;
  }
};
