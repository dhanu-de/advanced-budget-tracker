import React, { useState, useMemo } from 'react';
import { Users, Plus, ArrowDown, GitMerge } from 'lucide-react';

const C = {
  surface:'#0d1526', raised:'#111e33', hover:'#172238', border:'#1a2d47', borderHi:'#233d5e',
  txt:'#dce8f5', txt2:'#7a98b8', txt3:'#3f5977',
  accent:'#5b6ff0', green:'#22d3a0', red:'#f05b7c', violet:'#9b7bf0',
};
const INPUT = { width:'100%', background:C.raised, color:C.txt, border:`1.5px solid ${C.borderHi}`, borderRadius:10, padding:'11px 14px', fontSize:15, fontFamily:'Inter,sans-serif', outline:'none' };
const LABEL = { display:'block', fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:C.txt3, marginBottom:6 };

const InlineForm = ({ onSave, onClose }) => {
  const [desc,  setDesc]  = useState('');
  const [amt,   setAmt]   = useState('');
  const [ppl,   setPpl]   = useState(2);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault(); setError('');
    const a = parseFloat(amt), p = parseInt(ppl, 10);
    if (!desc || isNaN(a) || a<=0 || isNaN(p) || p<2) { setError('Enter description, amount (>0) and at least 2 people'); return; }
    onSave({ description:desc, totalAmount:a, totalParticipants:p });
    onClose();
  };

  return (
    <form onSubmit={submit} style={{ background:C.raised, border:`1px solid ${C.borderHi}`, borderRadius:14, padding:'1.2rem', display:'flex', flexDirection:'column', gap:'1rem', marginTop:'0.75rem' }}>
      {error && <div style={{ padding:'8px 12px', borderRadius:8, background:'rgba(240,91,124,.1)', border:`1px solid rgba(240,91,124,.3)`, color:C.red, fontSize:13 }}>⚠ {error}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        <div><label style={LABEL}>Description</label><input style={INPUT} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Trip / Dinner" required /></div>
        <div><label style={LABEL}>Total Amount (₹)</label><input style={INPUT} type="number" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00" required /></div>
        <div><label style={LABEL}>No. of People</label><input style={INPUT} type="number" min={2} value={ppl} onChange={e=>setPpl(e.target.value)} required /></div>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <button type="button" onClick={onClose} style={{ padding:'9px 18px', borderRadius:9, border:`1.5px solid ${C.borderHi}`, background:C.surface, color:C.txt2, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
        <button type="submit" style={{ padding:'9px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${C.violet},#7c5ce0)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Save</button>
      </div>
    </form>
  );
};

const GroupSplitView = ({ splitExpenses = [], addSplitExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const { totalOwed, netBalance } = useMemo(() => {
    let totalOwed = 0;
    splitExpenses.forEach(e => { totalOwed += e.totalAmount - (e.totalAmount / e.totalParticipants); });
    return { totalOwed, netBalance: totalOwed };
  }, [splitExpenses]);

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${C.violet}18`, border:`1px solid ${C.violet}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Users size={18} color={C.violet} />
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.txt }}>Group Expenses</h2>
        </div>
        <p style={{ fontSize:13, color:C.txt3 }}>Track what friends owe you</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {[
          { label:'Total Owed to You', value: fmt(totalOwed), color:C.green, icon: ArrowDown },
          { label:'Net Split Balance',  value: fmt(netBalance), color:C.violet, icon: GitMerge },
        ].map(({ label, value, color, icon:Icon }) => (
          <div key={label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'1.1rem 1.3rem', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={18} color={color}/>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{label}</p>
              <p style={{ fontSize:20, fontWeight:800, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:'1.4rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.txt }}>Group Expense History</h3>
          <button onClick={() => setShowForm(s=>!s)} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${C.violet},#7c5ce0)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <Plus size={14}/> Log Expense
          </button>
        </div>

        {showForm && <InlineForm onSave={addSplitExpense} onClose={() => setShowForm(false)} />}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {splitExpenses.map(exp => {
            const share   = exp.totalAmount / exp.totalParticipants;
            const owedToU = exp.totalAmount - share;
            return (
              <div key={exp.id} style={{ background:C.raised, borderRadius:12, padding:'1rem 1.2rem', borderLeft:`3px solid ${C.violet}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:C.txt }}>{exp.description}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:C.violet }}>{fmt(exp.totalAmount)} paid</span>
                </div>
                <p style={{ fontSize:13, color:C.txt3, marginBottom:6 }}>{exp.totalParticipants} people — You + {exp.totalParticipants-1} friend{exp.totalParticipants>2?'s':''}</p>
                <div style={{ display:'flex', gap:16 }}>
                  <span style={{ fontSize:13, color:C.txt2 }}>Each owes: <strong style={{ color:C.green }}>{fmt(share)}</strong></span>
                  <span style={{ fontSize:13, color:C.txt2 }}>You get back: <strong style={{ color:C.green }}>{fmt(owedToU)}</strong></span>
                </div>
              </div>
            );
          })}
          {splitExpenses.length === 0 && (
            <div style={{ padding:'2.5rem', textAlign:'center', color:C.txt3, fontSize:14 }}>
              No group expenses yet. Log your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSplitView;