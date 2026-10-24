import React, { useState } from 'react';
import { Plus, Target, PlusCircle, CheckCircle2, Trash2, X } from 'lucide-react';

const FIELD = { width:'100%', padding:'10px 13px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#1e293b', background:'#fff', fontFamily:'Inter,sans-serif', outline:'none' };
const LABEL = { display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em' };
const focus = e => e.target.style.borderColor='#6366f1';
const blur  = e => e.target.style.borderColor='#e2e8f0';

function GoalModal({ onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const submit = e => {
    e.preventDefault(); setError('');
    const amt = parseFloat(target);
    if (!title.trim()) { setError('Enter a goal name'); return; }
    if (!amt || amt <= 0) { setError('Enter a valid target amount'); return; }
    onSave({ title: title.trim(), target: amt, targetDate: date });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'1.5rem', width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>New Savings Goal</h3>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', borderRadius:8, padding:6, cursor:'pointer', color:'#64748b' }}><X size={16}/></button>
        </div>
        {error && <div style={{ padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, fontSize:13, marginBottom:14 }}>⚠ {error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={LABEL}>Goal Name</label>
            <input style={FIELD} type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Emergency Fund" onFocus={focus} onBlur={blur}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div>
              <label style={LABEL}>Target Amount (₹)</label>
              <input style={FIELD} type="number" step="0.01" value={target} onChange={e=>setTarget(e.target.value)} placeholder="0.00" onFocus={focus} onBlur={blur}/>
            </div>
            <div>
              <label style={LABEL}>Target Date</label>
              <input style={FIELD} type="date" value={date} onChange={e=>setDate(e.target.value)} onFocus={focus} onBlur={blur}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContributeModal({ goal, onSave, onClose }) {
  const [amount, setAmount] = useState('');
  const [error,  setError]  = useState('');
  const remaining = Number(goal.target) - Number(goal.saved);

  const submit = e => {
    e.preventDefault(); setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)  { setError('Enter a valid amount'); return; }
    if (amt > remaining)   { setError(`Can't exceed remaining ${remaining.toFixed(2)}`); return; }
    onSave(goal.id, amt);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'1.5rem', width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>Add Money — {goal.title}</h3>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', borderRadius:8, padding:6, cursor:'pointer', color:'#64748b' }}><X size={16}/></button>
        </div>
        <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Remaining: <strong style={{ color:'#6366f1' }}>₹{remaining.toLocaleString('en-IN')}</strong></p>
        {error && <div style={{ padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, fontSize:13, marginBottom:12 }}>⚠ {error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:16 }}>
            <label style={LABEL}>Amount (₹)</label>
            <input style={FIELD} type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" autoFocus onFocus={focus} onBlur={blur}/>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>Add Money</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsView({ goals = [], addGoal, contributeToGoal, deleteGoal }) {
  const [showGoalModal, setShowGoalModal]     = useState(false);
  const [activeGoal,    setActiveGoal]        = useState(null);

  const totalSaved  = goals.reduce((s,g) => s + Number(g.saved), 0);
  const totalTarget = goals.reduce((s,g) => s + Number(g.target), 0);
  const completed   = goals.filter(g => Number(g.saved) >= Number(g.target)).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem', fontFamily:'Inter,sans-serif' }}>
      {showGoalModal && <GoalModal onSave={addGoal} onClose={() => setShowGoalModal(false)}/>}
      {activeGoal   && <ContributeModal goal={activeGoal} onSave={contributeToGoal} onClose={() => setActiveGoal(null)}/>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#1e293b' }}>Savings Goals</h2>
          <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{completed} of {goals.length} completed</p>
        </div>
        <button onClick={() => setShowGoalModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          <Plus size={14}/> New Goal
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { label:'Total Saved',  value:`₹${totalSaved.toLocaleString('en-IN')}`,  color:'#6366f1' },
            { label:'Total Target', value:`₹${totalTarget.toLocaleString('en-IN')}`, color:'#8b5cf6' },
            { label:'Completed',    value:`${completed} / ${goals.length}`,           color:'#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'14px 16px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>{label}</p>
              <p style={{ fontSize:18, fontWeight:800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'3rem', textAlign:'center' }}>
          <Target size={40} color="#e2e8f0" style={{ margin:'0 auto 12px' }}/>
          <p style={{ fontWeight:700, color:'#64748b', marginBottom:4 }}>No goals yet</p>
          <p style={{ fontSize:13, color:'#94a3b8', marginBottom:16 }}>Create your first savings goal</p>
          <button onClick={() => setShowGoalModal(true)} style={{ padding:'9px 20px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Create Goal
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
          {goals.map(g => {
            const pct  = Math.min(100, (Number(g.saved)/Number(g.target))*100);
            const done = pct >= 100;
            return (
              <div key={g.id} style={{ background:'#fff', border:`1px solid ${done?'#bbf7d0':'#e2e8f0'}`, borderRadius:16, padding:'1.2rem', display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      {done ? <CheckCircle2 size={15} color="#10b981"/> : <Target size={15} color="#8b5cf6"/>}
                      <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.title}</h3>
                    </div>
                    {g.targetDate && <p style={{ fontSize:11, color:'#94a3b8' }}>Due {new Date(g.targetDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p>}
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700, background: done?'#f0fdf4':'#ede9fe', color: done?'#16a34a':'#7c3aed' }}>{pct.toFixed(0)}%</span>
                    <button onClick={() => deleteGoal(g.id)} style={{ border:'none', background:'none', color:'#cbd5e1', cursor:'pointer', borderRadius:6, padding:3 }}
                      onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color='#cbd5e1'}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, borderRadius:4, background: done?'#10b981':'linear-gradient(90deg,#8b5cf6,#6366f1)', transition:'width 0.5s' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontSize:12 }}>
                    <span style={{ color:'#64748b' }}>₹{Number(g.saved).toLocaleString('en-IN')} saved</span>
                    <span style={{ color:'#94a3b8' }}>₹{Number(g.target).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {!done ? (
                  <button onClick={() => setActiveGoal(g)} style={{ width:'100%', padding:'9px', borderRadius:10, border:'1.5px solid #ede9fe', background:'#faf5ff', color:'#7c3aed', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
                    onMouseEnter={e=>e.currentTarget.style.background='#ede9fe'} onMouseLeave={e=>e.currentTarget.style.background='#faf5ff'}>
                    <PlusCircle size={14}/> Add Money
                  </button>
                ) : (
                  <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#16a34a', padding:'6px', background:'#f0fdf4', borderRadius:10 }}>🎉 Goal Achieved!</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
