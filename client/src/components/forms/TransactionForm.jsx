import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const S = {
  overlay: { position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', background:'rgba(4,9,20,0.85)', backdropFilter:'blur(8px)' },
  modal:   { width:'100%', maxWidth:'440px', background:'#0d1526', border:'1.5px solid #233d5e', borderRadius:'18px', boxShadow:'0 25px 60px rgba(0,0,0,0.6)' },
  header:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.1rem 1.4rem', borderBottom:'1px solid #1a2d47' },
  title:   { fontSize:'15px', fontWeight:700, color:'#dce8f5' },
  close:   { width:30, height:30, borderRadius:8, border:'none', background:'#111e33', color:'#7a98b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  body:    { padding:'1.4rem', display:'flex', flexDirection:'column', gap:'1rem' },
  label:   { display:'block', fontSize:'11px', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#7a98b8', marginBottom:'6px' },
  input:   { width:'100%', background:'#111e33', color:'#dce8f5', border:'1.5px solid #233d5e', borderRadius:'10px', padding:'11px 14px', fontSize:'15px', fontFamily:'Inter,sans-serif', outline:'none' },
  error:   { fontSize:'13px', color:'#f05b7c', background:'rgba(240,91,124,0.1)', border:'1px solid rgba(240,91,124,0.3)', borderRadius:'10px', padding:'10px 14px' },
  row:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  btnRow:  { display:'flex', gap:'10px', paddingTop:'4px' },
  cancel:  { flex:1, padding:'11px', borderRadius:'10px', border:'1.5px solid #233d5e', background:'#111e33', color:'#7a98b8', fontSize:'14px', fontWeight:600, cursor:'pointer' },
  submit:  { flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#5b6ff0,#4254db)', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer' },
};

const TransactionForm = ({ categories = [], addTransaction, onClose }) => {
  const [amount,      setAmount]      = useState('');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId,  setCategoryId]  = useState('');
  const [type,        setType]        = useState('expense');
  const [notes,       setNotes]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || !description || !date || !categoryId) { setError('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      const ok = await addTransaction({
        amount: parseFloat(amount), description, title: description, date,
        category: categories.find(c => c.id === Number(categoryId))?.name || 'Others',
        categoryId: Number(categoryId), type, notes,
      });
      if (ok !== false) onClose?.();
    } finally { setSubmitting(false); }
  };

  const isIncome = type === 'income';

  return (
    <div style={S.overlay}>
      <div style={S.modal} className="animate-fade-up">
        <div style={S.header}>
          <span style={S.title}>Add Transaction</span>
          <button style={S.close} onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={S.body}>
          {error && <div style={S.error}>⚠ {error}</div>}

          {/* Type toggle */}
          <div>
            <div style={{ ...S.label }}>Type</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['expense','↓ Expense','#f05b7c'], ['income','↑ Income','#22d3a0']].map(([t, label, col]) => (
                <button key={t} type="button" onClick={() => setType(t)} style={{
                  padding:'10px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all .15s',
                  background: type===t ? `${col}18` : '#111e33',
                  border: `1.5px solid ${type===t ? col : '#233d5e'}`,
                  color: type===t ? col : '#7a98b8',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={S.row}>
            <div>
              <label style={S.label}>Amount (₹)</label>
              <input style={S.input} type="number" step="0.01" min="0" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label style={S.label}>Date</label>
              <input style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={S.label}>Description</label>
            <input style={S.input} type="text" value={description}
              onChange={e => setDescription(e.target.value)} placeholder="e.g. Grocery shopping" required />
          </div>

          <div>
            <label style={S.label}>Category</label>
            <select style={S.input} value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="" disabled style={{ color:'#3f5977' }}>Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={S.label}>Note <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <textarea style={{ ...S.input, resize:'none' }} rows={2} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>

          <div style={S.btnRow}>
            <button type="button" onClick={onClose} style={S.cancel}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...S.submit, opacity: submitting ? .6 : 1 }}>
              {submitting ? 'Saving…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;