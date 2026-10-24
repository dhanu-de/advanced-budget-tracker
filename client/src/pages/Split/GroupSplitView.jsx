import React, { useState, useMemo } from 'react';
import { Users, Plus, X } from 'lucide-react';

const FIELD = { width:'100%', padding:'10px 13px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#1e293b', background:'#fff', fontFamily:'Inter,sans-serif', outline:'none' };
const LABEL = { display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em' };
const focus = e => e.target.style.borderColor='#6366f1';
const blur  = e => e.target.style.borderColor='#e2e8f0';

function LogForm({ onSave, onClose }) {
  const [desc, setDesc] = useState('');
  const [amt,  setAmt]  = useState('');
  const [ppl,  setPpl]  = useState(2);
  const [error,setError]= useState('');

  const submit = e => {
    e.preventDefault(); setError('');
    const a = parseFloat(amt), p = parseInt(ppl,10);
    if (!desc || isNaN(a)||a<=0||isNaN(p)||p<2) { setError('Enter description, amount >0, and at least 2 people'); return; }
    onSave({ description:desc, totalAmount:a, totalParticipants:p });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'1.5rem', width:'100%', maxWidth:480 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>Log Group Expense</h3>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', borderRadius:8, padding:6, cursor:'pointer', color:'#64748b' }}><X size={16}/></button>
        </div>
        {error && <div style={{ padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, fontSize:13, marginBottom:14 }}>⚠ {error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={LABEL}>Description</label>
            <input style={FIELD} type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Goa Trip" onFocus={focus} onBlur={blur}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div>
              <label style={LABEL}>Total Amount (₹)</label>
              <input style={FIELD} type="number" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00" onFocus={focus} onBlur={blur}/>
            </div>
            <div>
              <label style={LABEL}>Number of People</label>
              <input style={FIELD} type="number" min={2} value={ppl} onChange={e=>setPpl(e.target.value)} onFocus={focus} onBlur={blur}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupSplitView({ splitExpenses = [], addSplitExpense }) {
  const [showForm, setShowForm] = useState(false);

  const { totalOwed } = useMemo(() => {
    let totalOwed = 0;
    splitExpenses.forEach(e => { totalOwed += e.totalAmount - e.totalAmount/e.totalParticipants; });
    return { totalOwed };
  }, [splitExpenses]);

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem', fontFamily:'Inter,sans-serif' }}>
      {showForm && <LogForm onSave={addSplitExpense} onClose={() => setShowForm(false)}/>}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#1e293b' }}>Group Expenses</h2>
          <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Track what friends owe you</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          <Plus size={14}/> Log Expense
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { label:'Total Owed to You', value: fmt(totalOwed), color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Group Expenses',    value: `${splitExpenses.length} logged`, color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:14, padding:'1.1rem 1.3rem' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>{label}</p>
            <p style={{ fontSize:20, fontWeight:800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'1.3rem' }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:14 }}>Expense History</h3>
        {splitExpenses.length === 0 ? (
          <div style={{ padding:'2rem', textAlign:'center', color:'#94a3b8', fontSize:14 }}>
            <Users size={36} color="#e2e8f0" style={{ margin:'0 auto 10px' }}/>
            <p>No group expenses yet. Log your first one!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {splitExpenses.map(exp => {
              const share   = exp.totalAmount / exp.totalParticipants;
              const owedToU = exp.totalAmount - share;
              return (
                <div key={exp.id} style={{ background:'#f8fafc', borderRadius:12, padding:'1rem 1.2rem', borderLeft:'3px solid #6366f1' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{exp.description}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#6366f1' }}>{fmt(exp.totalAmount)} paid</span>
                  </div>
                  <p style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>
                    {exp.totalParticipants} people — you + {exp.totalParticipants-1} friend{exp.totalParticipants>2?'s':''}
                  </p>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'#475569' }}>Each owes: <strong style={{ color:'#10b981' }}>{fmt(share)}</strong></span>
                    <span style={{ fontSize:12, color:'#475569' }}>You collect: <strong style={{ color:'#10b981' }}>{fmt(owedToU)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
