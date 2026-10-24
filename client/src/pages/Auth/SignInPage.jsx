import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react';
import { login, register, guest } from '../../services/firebaseService';

const Field = ({ label, type, value, onChange, placeholder, icon: Icon, right }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>
    <div style={{ position:'relative' }}>
      {Icon && <Icon size={16} color="#94a3b8" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', padding: Icon ? '11px 40px' : '11px 14px',
          paddingLeft: Icon ? 38 : 14,
          paddingRight: right ? 44 : 14,
          border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:15,
          color:'#1e293b', background:'#fff', outline:'none',
          transition:'border-color 0.15s',
          fontFamily:'Inter,sans-serif',
        }}
        onFocus={e => e.target.style.borderColor='#6366f1'}
        onBlur={e => e.target.style.borderColor='#e2e8f0'}
      />
      {right && <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>{right}</div>}
    </div>
  </div>
);

export default function SignInPage({ onLogin }) {
  const [mode,      setMode]      = useState('login');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [name,      setName]      = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name);
      onLogin(user);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try { const u = await guest(); onLogin(u); } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const features = [
    { icon: TrendingUp, color:'#10b981', label:'Smart Charts', sub:'Visual financial insights' },
    { icon: Shield,     color:'#6366f1', label:'100% Private', sub:'Data stays on your device' },
    { icon: Zap,        color:'#f59e0b', label:'AI Advisor',   sub:'Powered by Groq Llama 3' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f8fafc', fontFamily:'Inter,sans-serif' }}>
      {/* Left panel */}
      <div style={{ display:'none', flex:1, background:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)', padding:'3rem', flexDirection:'column', justifyContent:'center' }} className="md:flex">
        <div style={{ maxWidth:400 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:20 }}>B</div>
            <span style={{ color:'#fff', fontWeight:800, fontSize:22 }}>BudgetFlow</span>
          </div>
          <h2 style={{ color:'#fff', fontSize:32, fontWeight:800, lineHeight:1.2, marginBottom:12 }}>Take control of your finances</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, lineHeight:1.6, marginBottom:40 }}>
            Track spending, set goals, split bills, and get AI-powered advice — all in one place.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {features.map(({ icon: Icon, color, label, sub }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={20} color="#fff"/>
                </div>
                <div>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{label}</p>
                  <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }} className="md:hidden">
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18 }}>B</div>
            <span style={{ fontWeight:800, fontSize:20, color:'#1e293b' }}>BudgetFlow</span>
          </div>

          <h2 style={{ fontSize:26, fontWeight:800, color:'#1e293b', marginBottom:6 }}>
            {mode === 'login' ? 'Welcome back!' : 'Create account'}
          </h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>
            {mode === 'login' ? 'Sign in to your BudgetFlow account' : 'Start tracking your finances today'}
          </p>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:10, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13, marginBottom:16 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <Field label="Full Name" type="text" value={name} onChange={setName} placeholder="John Doe" icon={User} />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
            <Field label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••" icon={Lock}
              right={
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ border:'none', background:'none', cursor:'pointer', color:'#94a3b8' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              }
            />

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff',
              fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop:4,
            }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }}/>
            <span style={{ fontSize:12, color:'#94a3b8', fontWeight:500 }}>OR</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }}/>
          </div>

          <button onClick={loginAsGuest} disabled={loading} style={{
            width:'100%', padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0',
            background:'#fff', color:'#475569', fontSize:14, fontWeight:600, cursor:'pointer',
          }}>
            Continue as Guest (no sign-up)
          </button>

          <p style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m==='login'?'register':'login'); setError(''); }}
              style={{ border:'none', background:'none', color:'#6366f1', fontWeight:700, cursor:'pointer', fontSize:13 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
