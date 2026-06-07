import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Bot, User, Clock } from 'lucide-react';
import { sendMessageToGemini, buildFinancialContext } from '../../services/geminiService';

const QUICK_PROMPTS = [
    "📊 Analyze my spending",
    "🎯 Am I saving enough?",
    "💸 Where can I cut costs?",
    "📈 How to reach my goals faster?",
    "🏦 Give me a budget plan",
];

const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
);

const ChatMessage = ({ msg }) => {
    const isAI = msg.role === 'model';
    return (
        <div className={`flex items-end gap-2 mb-3 ${isAI ? '' : 'flex-row-reverse'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-gradient-to-br from-emerald-400 to-cyan-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${isAI
                ? 'bg-white dark:bg-gray-700 rounded-bl-none border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                : 'bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-br-none text-white'
                }`}>
                {msg.text}
            </div>
        </div>
    );
};

const QuotaBanner = ({ seconds, onRetry }) => (
    <div className="mx-4 mb-3 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl flex items-center gap-3">
        <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-orange-700 dark:text-orange-300 text-xs font-semibold">Rate limit hit — free tier</p>
            {seconds > 0 ? (
                <p className="text-orange-500 text-xs mt-0.5">Retry in <span className="font-bold">{seconds}s</span>…</p>
            ) : (
                <button onClick={onRetry} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline mt-0.5">
                    ✅ Ready! Click to retry
                </button>
            )}
        </div>
        {seconds === 0 && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
    </div>
);

const AIChatBot = ({ transactions = [], categories = [], goals = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: "👋 Hi! I'm BudgetFlow AI, your personal finance advisor!\n\nI can see your transaction data and goals. Ask me anything about your finances! 💰",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [quotaCountdown, setQuotaCountdown] = useState(0);
    const [lastFailedMessage, setLastFailedMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const countdownRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages, scrollToBottom]);

    // Cleanup countdown on unmount
    useEffect(() => () => clearInterval(countdownRef.current), []);

    const startQuotaCountdown = (seconds = 60) => {
        setQuotaCountdown(seconds);
        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setQuotaCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        setShowScrollBtn(!isNearBottom);
    };

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText || isLoading) return;

        setInput('');
        setLastFailedMessage(null);
        setQuotaCountdown(0);
        clearInterval(countdownRef.current);

        const newMessages = [...messages, { role: 'user', text: userText }];
        setMessages(newMessages);
        setIsLoading(true);

        const financialContext = buildFinancialContext(transactions, categories, goals);
        const apiHistory = newMessages.slice(1, -1).map(m => ({ role: m.role, text: m.text }));

        const response = await sendMessageToGemini(userText, financialContext, apiHistory);

        // Parse quota signal: "QUOTA_EXCEEDED:65"
        if (response.startsWith('QUOTA_EXCEEDED:')) {
            const delaySec = parseInt(response.split(':')[1], 10) || 65;
            setLastFailedMessage(userText);
            startQuotaCountdown(delaySec);
            setMessages(prev => [...prev, {
                role: 'model',
                text: `⏳ All models hit the free-tier quota. Retrying automatically in ${delaySec} seconds…\n\n💡 Tip: Generate a new API key at aistudio.google.com/app/apikey for instant access.`,
            }]);
        } else {
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        }
        setIsLoading(false);
    };

    const retryLastMessage = () => {
        if (lastFailedMessage && quotaCountdown === 0) {
            // Remove last two messages (user + quota error) and resend
            setMessages(prev => prev.slice(0, -2));
            sendMessage(lastFailedMessage);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const hasApiKey = !!(import.meta.env.VITE_GROQ_API_KEY) &&
        import.meta.env.VITE_GROQ_API_KEY !== 'your_groq_api_key_here';

    return (
        <>
            {/* Floating Button — sits above mobile bottom nav */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-red-500 hover:bg-red-600 rotate-90'
                    : 'bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-110'
                    }`}
                aria-label="Toggle AI Chat"
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-yellow-900" />
                    </span>
                )}
            </button>

            {/* Chat Window — clears both mobile nav bar and the toggle button */}
            {isOpen && (
                <div
                    className="fixed bottom-36 right-2 md:bottom-24 md:right-6 z-50 w-[calc(100vw-1rem)] sm:w-80 md:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    style={{ height: '480px', maxHeight: 'calc(100vh - 160px)' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">BudgetFlow AI</p>
                            <div className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-300 animate-pulse' : 'bg-green-300 animate-pulse'}`} />
                                <p className="text-green-100 text-xs">
                                    {!hasApiKey ? 'Needs API Key' : isLoading ? 'Thinking…' : 'Online · Llama 3.3 70B (Groq)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Key Warning Banner */}
                    {!hasApiKey && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-3 py-2">
                            <p className="text-amber-700 dark:text-amber-300 text-xs font-medium">
                                ⚠️ Add <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">VITE_GROQ_API_KEY</code> to your <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">.env</code> file to activate AI.
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 space-y-1"
                    >
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} msg={msg} />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quota countdown banner */}
                    {(quotaCountdown > 0 || (lastFailedMessage && quotaCountdown === 0)) && (
                        <QuotaBanner seconds={quotaCountdown} onRetry={retryLastMessage} />
                    )}

                    {/* Scroll to bottom button */}
                    {showScrollBtn && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-24 right-8 z-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-1.5 shadow-md hover:shadow-lg transition"
                        >
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    )}

                    {/* Quick Prompts */}
                    <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 px-3 py-2 flex gap-2 overflow-x-auto">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(prompt)}
                                disabled={isLoading || quotaCountdown > 0}
                                className="flex-shrink-0 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-3 py-3 flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={quotaCountdown > 0 ? `Wait ${quotaCountdown}s to send…` : "Ask about your finances..."}
                            className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 max-h-24 min-h-[42px]"
                            rows={1}
                            disabled={isLoading || quotaCountdown > 0}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading || quotaCountdown > 0}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatBot;
