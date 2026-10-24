import React, { useState } from 'react';
import {
  User, Mail, Edit3, Save, X, TrendingUp, TrendingDown,
  Wallet, Target, CreditCard, ShieldCheck, LogOut, Bell,
} from 'lucide-react';

export default function ProfileView({ user, transactions = [], goals = [], onLogout, onUpdateName }) {
  const [editing,   setEditing]   = useState(false);
  const [newName,   setNewName]   = useState(user?.name || '');
  const [saving,    setSaving]    = useState(false);
  const [notifOn,   setNotifOn]   = useState(false);
  const [confirmDel,setConfirmDel]= useState(false);

  const income  = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance/income)*100).toFixed(0) : 0;
  const completedGoals = goals.filter(g=>Number(g.saved)>=Number(g.target)).length;
  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

  const saveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try { await onUpdateName?.(newName.trim()); setEditing(false); } catch {}
    setSaving(false);
  };

  const initials = (name, email) => {
    if (name?.trim()) return name.trim().slice(0,2).toUpperCase();
    if (email)        return email.slice(0,2).toUpperCase();
    return 'BF';
  };

  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN',{ month:'long', year:'numeric' })
    : 'Recently';

  const stats = [
    { label:'Total Income',   value:fmt(income),          color:'#10b981', icon:TrendingUp },
    { label:'Total Expenses', value:fmt(expense),         color:'#ef4444', icon:TrendingDown },
    { label:'Net Balance',    value:fmt(Math.abs(balance)),color:balance>=0?'#6366f1':'#ef4444', icon:Wallet },
    { label:'Savings Rate',   value:`${savingsRate}%`,    color:'#8b5cf6', icon:ShieldCheck },
    { label:'Transactions',   value:String(transactions.length), color:'#06b6d4', icon:CreditCard },
    { label:'Goals Done',     value:`${completedGoals}/${goals.length}`, color:'#f59e0b', icon:Target },
  ];

  return (
    <div style={{ maxWidth:580, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1rem', fontFamily:'Inter,sans-serif', paddingBottom:'5rem' }}>

      {/* Profile card */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, overflow:'hidden' }}>
        {/* Banner */}
        <div style={{ height:90, background:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)' }}/>
        <div style={{ padding:'0 1.4rem 1.4rem' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-36, marginBottom:14 }}>
            <div style={{ width:72, height:72, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, fontWeight:800, border:'4px solid #fff', boxShadow:'0 4px 16px rgba(99,102,241,.3)' }}>
              {initials(user?.name, user?.email)}
            </div>
            {!editing && (
              <button onClick={()=>{ setEditing(true); setNewName(user?.name||''); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                <Edit3 size={13}/> Edit
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&saveName()}
                style={{ flex:1, padding:'9px 13px', border:'1.5px solid #6366f1', borderRadius:10, fontSize:16, fontWeight:700, fontFamily:'Inter,sans-serif', outline:'none', color:'#1e293b' }}
                placeholder="Your name"/>
              <button onClick={saveName} disabled={saving} style={{ width:40, height:40, borderRadius:9, border:'none', background:'#6366f1', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Save size={15}/></button>
              <button onClick={()=>setEditing(false)} style={{ width:40, height:40, borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
            </div>
          ) : (
            <h2 style={{ fontSize:20, fontWeight:800, color:'#1e293b', marginBottom:4 }}>{user?.name || 'BudgetFlow User'}</h2>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:6, color:'#64748b', fontSize:13, marginBottom:3 }}>
            <Mail size={13}/> {user?.email}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:'#94a3b8', fontSize:12 }}>
            <User size={12}/> Member since {since}
            {user?.isGuest && <span style={{ marginLeft:6, padding:'2px 8px', borderRadius:20, background:'#fef9c3', color:'#a16207', border:'1px solid #fef08a', fontSize:11, fontWeight:700 }}>Guest</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Financial Summary</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {stats.map(({ label, value, color, icon:Icon }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={16} color={color}/>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:11, color:'#94a3b8', marginBottom:2 }}>{label}</p>
                <p style={{ fontSize:15, fontWeight:800, color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Settings</p>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:18, overflow:'hidden' }}>
          {/* Notifications toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bell size={16} color="#6366f1"/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>Notifications</p>
                <p style={{ fontSize:12, color:'#94a3b8' }}>Budget alerts & reminders</p>
              </div>
            </div>
            <button onClick={()=>setNotifOn(p=>!p)} style={{ width:44, height:24, borderRadius:12, border:'none', background:notifOn?'#6366f1':'#e2e8f0', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
              <span style={{ position:'absolute', top:2, left:notifOn?22:2, width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.2)', transition:'left .2s' }}/>
            </button>
          </div>
          <div style={{ borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', padding:'14px 16px', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldCheck size={16} color="#10b981"/>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>App Version</p>
              <p style={{ fontSize:12, color:'#94a3b8' }}>BudgetFlow v1.0 — PWA</p>
            </div>
            <span style={{ marginLeft:'auto', padding:'2px 8px', borderRadius:20, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', fontSize:11, fontWeight:700 }}>Latest</span>
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Account</p>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:18, overflow:'hidden' }}>
          <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'none', background:'none', cursor:'pointer', textAlign:'left' }}
            onMouseEnter={e=>e.currentTarget.style.background='#fffbeb'} onMouseLeave={e=>e.currentTarget.style.background=''}>
            <div style={{ width:36, height:36, borderRadius:9, background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center' }}><LogOut size={16} color="#d97706"/></div>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>Sign Out</p>
              <p style={{ fontSize:12, color:'#94a3b8' }}>Log out of your account</p>
            </div>
          </button>

          {!confirmDel ? (
            <button onClick={()=>setConfirmDel(true)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'none', borderTop:'1px solid #f1f5f9', borderTopStyle:'solid', background:'none', cursor:'pointer', textAlign:'left' }}
              onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'} onMouseLeave={e=>e.currentTarget.style.background=''}>
              <div style={{ width:36, height:36, borderRadius:9, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={16} color="#ef4444"/></div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'#ef4444' }}>Delete Account</p>
                <p style={{ fontSize:12, color:'#94a3b8' }}>Remove all data permanently</p>
              </div>
            </button>
          ) : (
            <div style={{ padding:'1rem 1.2rem', borderTop:'1px solid #f1f5f9', background:'#fef2f2' }}>
              <p style={{ fontSize:13, color:'#dc2626', marginBottom:10 }}>This cannot be undone. Are you sure?</p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={onLogout} style={{ flex:1, padding:'9px', borderRadius:9, border:'none', background:'#ef4444', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Yes, Delete</button>
                <button onClick={()=>setConfirmDel(false)} style={{ flex:1, padding:'9px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
