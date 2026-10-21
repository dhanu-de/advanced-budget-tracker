import React, { useState } from 'react';
import { User, Mail, Edit3, Save, X, TrendingUp, TrendingDown, Target, CreditCard, ShieldCheck, LogOut, Trash2, Bell } from 'lucide-react';

const C = {
  surface:'#0d1526', raised:'#111e33', hover:'#172238', border:'#1a2d47', borderHi:'#233d5e',
  txt:'#dce8f5', txt2:'#7a98b8', txt3:'#3f5977',
  accent:'#5b6ff0', green:'#22d3a0', red:'#f05b7c', violet:'#9b7bf0', amber:'#f0a533', sky:'#38c4f5',
};

const ProfileView = ({ user, transactions, goals, categories, onLogout, onUpdateName }) => {
  const [editing,           setEditing]           = useState(false);
  const [newName,           setNewName]           = useState(user?.name || '');
  const [saving,            setSaving]            = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsOn,   setNotificationsOn]   = useState(false);

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;
  const completedGoals = goals.filter(g => Number(g.saved) >= Number(g.target)).length;
  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try { await onUpdateName(newName.trim()); setEditing(false); } catch {}
    setSaving(false);
  };

  const getInitials = (name, email) => {
    if (name?.trim()) return name.trim().slice(0,2).toUpperCase();
    if (email) return email.slice(0,2).toUpperCase();
    return 'BF';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month:'long', year:'numeric' })
    : 'Recently joined';

  const stats = [
    { label:'Total Income',  value: fmt(totalIncome),          color: C.green,  icon: TrendingUp },
    { label:'Total Expenses',value: fmt(totalExpense),         color: C.red,    icon: TrendingDown },
    { label:'Net Balance',   value: fmt(Math.abs(balance)),    color: balance>=0?C.green:C.red, icon: CreditCard },
    { label:'Savings Rate',  value: `${savingsRate}%`,         color: C.violet, icon: ShieldCheck },
    { label:'Transactions',  value: transactions.length,       color: C.sky,    icon: CreditCard },
    { label:'Goals Done',    value: `${completedGoals}/${goals.length}`, color: C.amber, icon: Target },
  ];

  const SettingRow = ({ icon:Icon, color, title, sub, right }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:9, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color={color}/>
        </div>
        <div>
          <p style={{ fontSize:14, fontWeight:600, color:C.txt, marginBottom:1 }}>{title}</p>
          <p style={{ fontSize:12, color:C.txt3 }}>{sub}</p>
        </div>
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ maxWidth:600, margin:'0 auto', paddingBottom:'5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>

      {/* Profile Card */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, overflow:'hidden' }}>
        {/* Banner */}
        <div style={{ height:100, background:`linear-gradient(135deg, #1e2a4a, #2d1f4e, #1a2d5a)`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:.15, backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'20px 20px' }}/>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:C.accent, opacity:.12, filter:'blur(30px)' }}/>
        </div>

        <div style={{ padding:'0 1.4rem 1.4rem' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-36, marginBottom:14 }}>
            <div style={{ width:72, height:72, borderRadius:16, background:`linear-gradient(135deg,${C.accent},#4254db)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, fontWeight:800, border:`3px solid ${C.surface}`, boxShadow:'0 8px 24px rgba(91,111,240,.35)' }}>
              {getInitials(user?.name, user?.email)}
            </div>
            <button onClick={() => { setEditing(true); setNewName(user?.name||''); }}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:`1.5px solid ${C.borderHi}`, background:C.raised, color:C.txt2, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              <Edit3 size={13}/> Edit
            </button>
          </div>

          {editing ? (
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSaveName()}
                style={{ flex:1, background:C.raised, color:C.txt, border:`1.5px solid ${C.accent}`, borderRadius:10, padding:'9px 13px', fontSize:16, fontWeight:700, fontFamily:'Inter,sans-serif', outline:'none' }} placeholder="Your name" />
              <button onClick={handleSaveName} disabled={saving} style={{ width:40, height:40, borderRadius:9, border:'none', background:C.accent, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Save size={15}/></button>
              <button onClick={()=>setEditing(false)} style={{ width:40, height:40, borderRadius:9, border:`1.5px solid ${C.borderHi}`, background:C.raised, color:C.txt2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
            </div>
          ) : (
            <h2 style={{ fontSize:20, fontWeight:800, color:C.txt, marginBottom:6 }}>{user?.name || 'BudgetFlow User'}</h2>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:6, color:C.txt3, fontSize:13, marginBottom:4 }}>
            <Mail size={13}/> <span>{user?.email}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:C.txt3, fontSize:12 }}>
            <User size={12}/> <span>Member since {memberSince}</span>
            {user?.isGuest && <span style={{ marginLeft:6, padding:'2px 8px', borderRadius:20, background:`${C.amber}18`, color:C.amber, border:`1px solid ${C.amber}33`, fontSize:11, fontWeight:700 }}>Guest</span>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Financial Summary</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {stats.map(({ label, value, color, icon:Icon }) => (
            <div key={label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={16} color={color}/>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:11, color:C.txt3, marginBottom:2 }}>{label}</p>
                <p style={{ fontSize:16, fontWeight:800, color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Settings</p>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${C.accent}15`, border:`1px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bell size={16} color={C.accent}/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:C.txt, marginBottom:1 }}>Notifications</p>
                <p style={{ fontSize:12, color:C.txt3 }}>Budget alerts & reminders</p>
              </div>
            </div>
            <button onClick={()=>setNotificationsOn(p=>!p)} style={{ width:44, height:24, borderRadius:12, border:'none', background: notificationsOn ? C.accent : C.raised, position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
              <span style={{ position:'absolute', top:2, left: notificationsOn?22:2, width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.4)', transition:'left .2s' }}/>
            </button>
          </div>
          <SettingRow icon={ShieldCheck} color={C.green} title="App Version" sub="BudgetFlow v1.0 — PWA"
            right={<span style={{ padding:'3px 10px', borderRadius:20, background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}33`, fontSize:11, fontWeight:700 }}>Latest</span>} />
        </div>
      </div>

      {/* Account */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Account</p>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:'hidden' }}>
          <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 18px', border:'none', background:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background='none'}>
            <div style={{ width:36, height:36, borderRadius:9, background:`${C.amber}15`, border:`1px solid ${C.amber}30`, display:'flex', alignItems:'center', justifyContent:'center' }}><LogOut size={16} color={C.amber}/></div>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:C.txt, marginBottom:1 }}>Sign Out</p>
              <p style={{ fontSize:12, color:C.txt3 }}>Log out of your account</p>
            </div>
          </button>

          {!showDeleteConfirm ? (
            <button onClick={()=>setShowDeleteConfirm(true)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderTop:`1px solid ${C.border}`, border:'none', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:C.border, background:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${C.red}15`, border:`1px solid ${C.red}30`, display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={16} color={C.red}/></div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:C.red, marginBottom:1 }}>Delete Account</p>
                <p style={{ fontSize:12, color:C.txt3 }}>Permanently remove all your data</p>
              </div>
            </button>
          ) : (
            <div style={{ padding:'1rem 1.2rem', borderTop:`1px solid ${C.border}`, background:'rgba(240,91,124,.05)' }}>
              <p style={{ fontSize:13, color:C.red, marginBottom:12 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={onLogout} style={{ flex:1, padding:'9px', borderRadius:9, border:'none', background:C.red, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Yes, Delete</button>
                <button onClick={()=>setShowDeleteConfirm(false)} style={{ flex:1, padding:'9px', borderRadius:9, border:`1.5px solid ${C.borderHi}`, background:C.raised, color:C.txt2, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
