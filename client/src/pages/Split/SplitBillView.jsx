import React, { useState, useMemo } from 'react';
import { Scissors, Plus, Trash2, Equal, CheckCircle2 } from 'lucide-react';

const C = {
  surface:'#0d1526', raised:'#111e33', hover:'#172238', border:'#1a2d47', borderHi:'#233d5e',
  txt:'#dce8f5', txt2:'#7a98b8', txt3:'#3f5977',
  accent:'#5b6ff0', green:'#22d3a0', red:'#f05b7c', amber:'#f0a533',
};
const INPUT = { width:'100%', background:C.raised, color:C.txt, border:`1.5px solid ${C.borderHi}`, borderRadius:10, padding:'11px 14px', fontSize:15, fontFamily:'Inter,sans-serif', outline:'none' };
const LABEL = { display:'block', fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:C.txt3, marginBottom:6 };

const SplitBillView = ({ categories = [], addTransaction }) => {
  const [amount,       setAmount]       = useState('');
  const [description,  setDescription]  = useState('');
  const [date,         setDate]         = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId,   setCategoryId]   = useState('');
  const [participants, setParticipants] = useState([{ name:'Person 1', amount:'' }, { name:'Person 2', amount:'' }]);
  const [error,        setError]        = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);

  const totalAssigned = useMemo(() => participants.reduce((s, p) => s + (Number(p.amount) || 0), 0), [participants]);
  const remaining = Number(amount || 0) - totalAssigned;

  const addRow    = () => setParticipants(p => [...p, { name:`Person ${p.length + 1}`, amount:'' }]);
  const removeRow = (i) => setParticipants(p => p.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) => setParticipants(p => { const n=[...p]; n[i]={...n[i],[key]:val}; return n; });

  const equalSplit = () => {
    const total = Number(amount);
    if (!total || !participants.length) return;
    const each = +(total / participants.length).toFixed(2);
    const adj  = +(total - each * participants.length).toFixed(2);
    setParticipants(p => p.map((x,i) => ({ ...x, amount: String(i===0 ? each+adj : each) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(false);
    const total = Number(amount);
    if (!total || !description || !date || !categoryId) { setError('Please fill all required fields'); return; }
    if (participants.length < 2) { setError('Add at least two participants'); return; }
    if (Math.abs(totalAssigned - total) > 0.01) { setError(`Amounts must sum to ₹${total.toFixed(2)} — currently ₹${totalAssigned.toFixed(2)}`); return; }
    setSubmitting(true);
    try {
      const cat = categories.find(c => c.id === Number(categoryId));
      for (const p of participants) {
        await addTransaction({ amount: Number(p.amount)||0, description:`${description} (${p.name})`, date, category: cat?.name||'Others', categoryId: Number(categoryId), type: cat?.type||'expense', notes:`Split among ${participants.length} people` });
      }
      setSuccess(true);
      setAmount(''); setDescription(''); setCategoryId('');
      setParticipants([{ name:'Person 1', amount:'' }, { name:'Person 2', amount:'' }]);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${C.accent}18`, border:`1px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Scissors size={18} color={C.accent} />
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.txt }}>Split Bill</h2>
        </div>
        <p style={{ fontSize:13, color:C.txt3 }}>Divide expenses fairly among friends</p>
      </div>

      {success && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:12, background:'rgba(34,211,160,.1)', border:`1px solid rgba(34,211,160,.3)`, color:C.green, fontWeight:600, fontSize:14 }}>
          <CheckCircle2 size={16}/> Split transactions saved!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {error && <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(240,91,124,.1)', border:`1px solid rgba(240,91,124,.3)`, color:C.red, fontSize:13 }}>⚠ {error}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={LABEL}>Total Amount (₹)</label><input style={INPUT} type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" required /></div>
          <div><label style={LABEL}>Date</label><input style={INPUT} type="date" value={date} onChange={e=>setDate(e.target.value)} required /></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={LABEL}>Description</label><input style={INPUT} type="text" value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Dinner at ABC" required /></div>
          <div>
            <label style={LABEL}>Category</label>
            <select style={INPUT} value={categoryId} onChange={e=>setCategoryId(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:C.raised, borderRadius:10, border:`1px solid ${C.borderHi}` }}>
          <div style={{ fontSize:13 }}>
            <span style={{ color:C.txt3 }}>Assigned: </span><span style={{ color:C.txt, fontWeight:600 }}>₹{totalAssigned.toFixed(2)}</span>
            <span style={{ color:C.txt3, marginLeft:16 }}>Remaining: </span>
            <span style={{ color: remaining<0?C.red:remaining===0?C.green:C.amber, fontWeight:700 }}>₹{remaining.toFixed(2)}</span>
          </div>
          <button type="button" onClick={equalSplit} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:8, border:`1.5px solid ${C.accent}55`, background:`${C.accent}15`, color:C.accent, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            <Equal size={13}/> Equal Split
          </button>
        </div>

        <div>
          <label style={LABEL}>Participants</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {participants.map((p, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 130px 38px', gap:8, alignItems:'flex-end' }}>
                <input style={INPUT} type="text" value={p.name} onChange={e=>updateRow(i,'name',e.target.value)} placeholder={`Person ${i+1}`} />
                <input style={INPUT} type="number" step="0.01" value={p.amount} onChange={e=>updateRow(i,'amount',e.target.value)} placeholder="0.00" />
                <button type="button" onClick={()=>removeRow(i)} disabled={participants.length<=2}
                  style={{ height:44, borderRadius:8, border:'none', background:`${C.red}18`, color:C.red, cursor:participants.length<=2?'not-allowed':'pointer', opacity:participants.length<=2?.35:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:`1.5px solid ${C.borderHi}`, background:C.raised, color:C.txt2, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={13}/> Add Person
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" disabled={submitting} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.accent},#4254db)`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', opacity:submitting?.6:1 }}>
            {submitting ? 'Saving…' : 'Create Split'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SplitBillView;