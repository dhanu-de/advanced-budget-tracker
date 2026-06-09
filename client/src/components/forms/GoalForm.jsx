import React, { useState } from 'react';
import { X } from 'lucide-react';

const S = {
  overlay: { position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', background:'rgba(4,9,20,0.85)', backdropFilter:'blur(8px)' },
  modal:   { width:'100%', maxWidth:'420px', background:'#0d1526', border:'1.5px solid #233d5e', borderRadius:'18px', boxShadow:'0 25px 60px rgba(0,0,0,0.6)' },
  header:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.1rem 1.4rem', borderBottom:'1px solid #1a2d47' },
  title:   { fontSize:'15px', fontWeight:700, color:'#dce8f5' },
  close:   { width:30, height:30, borderRadius:8, border:'none', background:'#111e33', color:'#7a98b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  body:    { padding:'1.4rem', display:'flex', flexDirection:'column', gap:'1rem' },
  label:   { display:'block', fontSize:'11px', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#7a98b8', marginBottom:'6px' },
  input:   { width:'100%', background:'#111e33', color:'#dce8f5', border:'1.5px solid #233d5e', borderRadius:'10px', padding:'11px 14px', fontSize:'15px', fontFamily:'Inter,sans-serif', outline:'none' },
  error:   { fontSize:'13px', color:'#f05b7c', background:'rgba(240,91,124,0.1)', border:'1px solid rgba(240,91,124,0.3)', borderRadius:'10px', padding:'10px 14px' },
  btnRow:  { display:'flex', gap:'10px', paddingTop:'4px' },
  cancel:  { flex:1, padding:'11px', borderRadius:'10px', border:'1.5px solid #233d5e', background:'#111e33', color:'#7a98b8', fontSize:'14px', fontWeight:600, cursor:'pointer' },
  submit:  { flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#9b7bf0,#7c5ce0)', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer' },
};

const GoalForm = ({ addGoal, onClose }) => {
  const [title,      setTitle]      = useState('');
  const [target,     setTarget]     = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !target || Number(target) <= 0) { setError('Enter a goal name and a target amount greater than 0'); return; }
    setSubmitting(true);
    try { addGoal({ title, target: parseFloat(target), targetDate }); onClose?.(); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal} className="animate-fade-up">
        <div style={S.header}>
          <span style={S.title}>New Savings Goal</span>
          <button style={S.close} onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={S.body}>
          {error && <div style={S.error}>⚠ {error}</div>}

          <div>
            <label style={S.label}>Goal Name</label>
            <input style={S.input} type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Vacation Fund" required />
          </div>
          <div>
            <label style={S.label}>Target Amount (₹)</label>
            <input style={S.input} type="number" step="0.01" min="1" value={target}
              onChange={e => setTarget(e.target.value)} placeholder="e.g. 100000" required />
          </div>
          <div>
            <label style={S.label}>Target Date <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <input style={S.input} type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>

          <div style={S.btnRow}>
            <button type="button" onClick={onClose} style={S.cancel}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...S.submit, opacity: submitting ? .6 : 1 }}>
              {submitting ? 'Creating…' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
