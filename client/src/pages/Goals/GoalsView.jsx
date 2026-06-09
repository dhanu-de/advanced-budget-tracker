import React, { useState } from 'react';
import { Plus, Target, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import GoalForm from '../../components/forms/GoalForm';
import GoalContributionModal from '../../components/forms/GoalContributionModal';

const C = {
  surface:'#0d1526', raised:'#111e33', border:'#1a2d47', borderHi:'#233d5e',
  txt:'#dce8f5', txt2:'#7a98b8', txt3:'#3f5977',
  accent:'#5b6ff0', green:'#22d3a0', red:'#f05b7c', violet:'#9b7bf0', amber:'#f0a533',
};

const GoalsView = ({ goals = [], memos = [], addMemo, addGoal, contributeToGoal }) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeGoal,   setActiveGoal]   = useState(null);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color: C.txt }}>Savings Goals</h2>
          <p style={{ fontSize:13, color: C.txt3, marginTop:2 }}>{goals.length} goal{goals.length!==1?'s':''} · {goals.filter(g=>Number(g.saved)>=Number(g.target)).length} completed</p>
        </div>
        <button onClick={() => setShowGoalForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#9b7bf0,#7c5ce0)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          <Plus size={15}/> New Goal
        </button>
      </div>

      {showGoalForm && <GoalForm addGoal={addGoal} onClose={() => setShowGoalForm(false)} />}
      {activeGoal   && <GoalContributionModal memoId={activeGoal} contributeToGoal={contributeToGoal} onClose={() => setActiveGoal(null)} />}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'3rem', textAlign:'center' }}>
          <Target size={40} color={C.txt3} style={{ margin:'0 auto 1rem' }} />
          <p style={{ color: C.txt2, fontWeight:600, marginBottom:6 }}>No goals yet</p>
          <p style={{ color: C.txt3, fontSize:13 }}>Create your first savings goal to start tracking progress</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
          {goals.map(goal => {
            const pct = Math.min((Number(goal.saved) / Number(goal.target)) * 100, 100);
            const done = pct >= 100;
            return (
              <div key={goal.id} style={{ background: C.surface, border:`1px solid ${done ? C.green+'44' : C.border}`, borderRadius:16, padding:'1.3rem', display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                {/* Title row */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      {done
                        ? <CheckCircle2 size={15} color={C.green} />
                        : <Clock size={15} color={C.violet} />}
                      <h3 style={{ fontSize:15, fontWeight:700, color: C.txt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{goal.title}</h3>
                    </div>
                    {goal.targetDate && (
                      <p style={{ fontSize:12, color: C.txt3 }}>Target: {new Date(goal.targetDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p>
                    )}
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color: done ? C.green : C.violet, background: done ? 'rgba(34,211,160,.1)' : 'rgba(155,123,240,.1)', padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height:6, background: C.raised, borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:4, width:`${pct}%`, background: done ? `linear-gradient(90deg,${C.green},#16a34a)` : `linear-gradient(90deg,${C.violet},${C.accent})`, transition:'width .5s ease' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:12, color: C.txt3 }}>
                    <span>Saved: <strong style={{ color: C.txt }}>₹{Number(goal.saved).toLocaleString('en-IN')}</strong></span>
                    <span>Target: <strong style={{ color: C.txt }}>₹{Number(goal.target).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                {/* CTA */}
                {!done && (
                  <button onClick={() => setActiveGoal(goal.id)} style={{ width:'100%', padding:'9px', borderRadius:10, border:`1.5px solid ${C.violet}44`, background: 'rgba(155,123,240,.08)', color: C.violet, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(155,123,240,.18)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(155,123,240,.08)'}>
                    <PlusCircle size={14}/> Add Money
                  </button>
                )}
                {done && (
                  <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color: C.green }}>🎉 Goal Achieved!</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      {memos.length > 0 && (
        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'1.3rem' }}>
          <h3 style={{ fontSize:14, fontWeight:700, color: C.txt, marginBottom:'0.9rem' }}>Planning Notes</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {memos.map(m => (
              <div key={m.id} style={{ background: C.raised, borderRadius:10, padding:'10px 14px', border:`1px solid ${C.borderHi}` }}>
                <p style={{ fontSize:14, fontWeight:600, color: C.txt }}>{m.title}</p>
                {m.content && <p style={{ fontSize:13, color: C.txt3, marginTop:3 }}>{m.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
