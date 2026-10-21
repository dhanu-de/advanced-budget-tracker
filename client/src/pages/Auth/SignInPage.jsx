import React, { useState, lazy, Suspense } from 'react';
import { Mail, Lock, User, Loader, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { login, register, guest } from '../../services/firebaseService';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';

// Lazy-load 3D hero — never blocks the form
const SignInHero = lazy(() => import('../../components/3d/SignInHero'));

const SignInPage = ({ onLogin }) => {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const { supported: webglOk } = useWebGLSupport();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
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
    { icon: TrendingUp,  text: 'Track income & expenses'          },
    { icon: ShieldCheck, text: 'Stored privately in your browser'  },
    { icon: Zap,         text: 'AI-powered insights'              },
  ];

  return (
    <div className="min-h-screen bg-bf-bg flex flex-col md:flex-row">

      {/* ── Left panel — 3D hero (hidden on mobile) ──────────────────────── */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg,#080e20 0%,#0d1526 60%,#111e33 100%)' }}>

        {/* 3D canvas behind everything */}
        {webglOk && (
          <Suspense fallback={null}>
            <SignInHero />
          </Suspense>
        )}

        {/* Static dot grid fallback (always visible, subtle behind 3D) */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Foreground text — sits above the canvas */}
        <div className="relative z-10 text-center max-w-sm pointer-events-none select-none">
          <div className="w-20 h-20 rounded-3xl bg-bf-accent flex items-center justify-center text-white text-3xl font-black mx-auto mb-8 shadow-2xl"
               style={{ boxShadow: '0 0 40px rgba(91,111,240,0.5)' }}>
            BF
          </div>
          <h1 className="text-4xl font-black text-bf-txt mb-3 leading-tight">
            Budget<span style={{ color: 'var(--c-accent)' }}>Flow</span>
          </h1>
          <p className="text-bf-txt2 text-lg mb-10 leading-relaxed">
            Your personal finance companion. Track, analyse, and grow your wealth.
          </p>

          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(91,111,240,0.15)', border: '1px solid rgba(91,111,240,0.3)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                </div>
                <span className="text-bf-txt2 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">

        {/* Mobile logo */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-bf-accent flex items-center justify-center text-white text-xl font-black mb-3 shadow-xl">
            BF
          </div>
          <h1 className="text-2xl font-black text-bf-txt">BudgetFlow</h1>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-bf-txt mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-bf-txt2 text-sm mb-7">
            {isRegister
              ? 'Start tracking your finances today'
              : 'Sign in to continue to BudgetFlow'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl"
                 style={{ background: 'rgba(240,91,124,0.1)', border: '1px solid rgba(240,91,124,0.3)', color: 'var(--c-red)' }}>
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-bf-txt2 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bf-txt3" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-bf-txt2 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bf-txt3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bf-txt2 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bf-txt3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                />
              </div>
              {isRegister && <p className="text-bf-txt3 text-xs mt-1.5">Minimum 6 characters</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 focus-bf"
              style={{
                background: 'linear-gradient(135deg,var(--c-accent),var(--c-accent-2))',
                boxShadow: '0 4px 20px rgba(91,111,240,0.35)',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-bf-border" />
            <span className="text-bf-txt3 text-xs">or</span>
            <div className="flex-1 h-px bg-bf-border" />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3 border border-bf-hi text-bf-txt2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 hover:bg-bf-hover focus-bf"
            style={{ background: 'var(--c-raised)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <User className="w-4 h-4 text-bf-txt3" />
            Continue as Guest
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-bf-txt3 mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegister(p => !p); setError(''); }}
              className="font-semibold transition-colors focus-bf"
              style={{ color: 'var(--c-accent)' }}
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