import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

const GoalContributionModal = ({ memoId, contributeToGoal, onClose }) => {
  const [amount,    setAmount]    = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount greater than 0'); return; }
    setSubmitting(true);
    try { await contributeToGoal(memoId, amount); onClose?.(); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', background:'rgba(4,9,20,0.85)', backdropFilter:'blur(8px)' }}>
      <div className="animate-fade-up" style={{ width:'100%', maxWidth:'380px', background:'#0d1526', border:'1.5px solid #233d5e', borderRadius:'18px', boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.4rem', borderBottom:'1px solid #1a2d47' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <PlusCircle size={17} color="#9b7bf0" />
            <span style={{ fontSize:15, fontWeight:700, color:'#dce8f5' }}>Add Contribution</span>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'none', background:'#111e33', color:'#7a98b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'1.4rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          {error && (
            <div style={{ fontSize:13, color:'#f05b7c', background:'rgba(240,91,124,0.1)', border:'1px solid rgba(240,91,124,0.3)', borderRadius:10, padding:'10px 14px' }}>
              ⚠ {error}
            </div>
          )}

          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#7a98b8', marginBottom:6 }}>
              Amount (₹)
            </label>
            <input
              type="number" step="0.01" min="1" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="e.g. 500" required autoFocus
              style={{ width:'100%', background:'#111e33', color:'#dce8f5', border:'1.5px solid #233d5e', borderRadius:10, padding:'11px 14px', fontSize:15, fontFamily:'Inter,sans-serif', outline:'none' }}
            />
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, border:'1.5px solid #233d5e', background:'#111e33', color:'#7a98b8', fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ flex:1, padding:11, borderRadius:10, border:'none', background:'linear-gradient(135deg,#9b7bf0,#7c5ce0)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', opacity: submitting ? .6 : 1 }}>
              {submitting ? 'Adding…' : 'Contribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalContributionModal;