import React, { useState } from 'react';
import { Mail, Lock, User, Loader, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { login, register, guest } from '../../services/firebaseService';

const SignInPage = ({ onLogin }) => {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Both login() and register() return the user object directly
      const user = isRegister
        ? await register(email, password, name)
        : await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await guest();
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp,  text: 'Track income & expenses' },
    { icon: ShieldCheck, text: 'Secure local storage'     },
    { icon: Zap,         text: 'AI-powered insights'      },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">

      {/* ── Left panel (hidden on mobile) ──────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background dots */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-8 shadow-2xl shadow-emerald-900/50">
            BF
          </div>
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">
            Budget<span className="text-emerald-400">Flow</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Your personal finance companion. Track, analyse, and grow your wealth.
          </p>

          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel / form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">

        {/* Mobile logo */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-black mb-3 shadow-xl">
            BF
          </div>
          <h1 className="text-2xl font-black text-white">BudgetFlow</h1>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-400 text-sm mb-7">
            {isRegister
              ? 'Start tracking your finances today'
              : 'Sign in to continue to BudgetFlow'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
              </div>
              {isRegister && (
                <p className="text-gray-500 text-xs mt-1.5">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <User className="w-4 h-4 text-gray-400" />
            Continue as Guest
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegister(p => !p); setError(''); }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;