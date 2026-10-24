import React, { useState, useMemo } from 'react';
import { Scissors, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const FIELD = { width:'100%', padding:'10px 13px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#1e293b', background:'#fff', fontFamily:'Inter,sans-serif', outline:'none' };
const LABEL = { display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em' };
const focus = e => e.target.style.borderColor='#6366f1';
const blur  = e => e.target.style.borderColor='#e2e8f0';

export default function SplitBillView({ categories = [], addTransaction }) {
  const [amount,       setAmount]       = useState('');
  const [desc,         setDesc]         = useState('');
  const [date,         setDate]         = useState(() => new Date().toISOString().split('T')[0]);
  const [catId,        setCatId]        = useState('');
  const [participants, setParticipants] = useState([{ name:'Person 1',amount:'' },{ name:'Person 2',amount:'' }]);
  const [error,        setError]        = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);

  const totalAssigned = useMemo(() => participants.reduce((s,p) => s+(Number(p.amount)||0), 0), [participants]);
  const remaining     = Number(amount||0) - totalAssigned;

  const addRow    = ()    => setParticipants(p => [...p, { name:`Person ${p.length+1}`, amount:'' }]);
  const removeRow = i     => setParticipants(p => p.filter((_,idx) => idx!==i));
  const updateRow = (i,k,v) => setParticipants(p => { const n=[...p]; n[i]={...n[i],[k]:v}; return n; });

  const equalSplit = () => {
    const total = Number(amount);
    if (!total || !participants.length) return;
    const each = +(total/participants.length).toFixed(2);
    const adj  = +(total - each*participants.length).toFixed(2);
    setParticipants(p => p.map((x,i) => ({ ...x, amount: String(i===0?each+adj:each) })));
  };

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess(false);
    const total = Number(amount);
    if (!total || !desc || !date || !catId) { setError('Fill all required fields'); return; }
    if (participants.length < 2)            { setError('At least 2 participants needed'); return; }
    if (Math.abs(totalAssigned - total) > 0.01) { setError(`Amounts must sum to ₹${total.toFixed(2)} (currently ₹${totalAssigned.toFixed(2)})`); return; }
    setSubmitting(true);
    try {
      const cat = categories.find(c => c.id===Number(catId));
      for (const p of participants) {
        await addTransaction({ amount:Number(p.amount)||0, description:`${desc} (${p.name})`, date, category:cat?.name||'Others', categoryId:Number(catId), type:'expense', notes:`Split among ${participants.length} people` });
      }
      setSuccess(true);
      setAmount(''); setDesc(''); setCatId('');
      setParticipants([{ name:'Person 1',amount:'' },{ name:'Person 2',amount:'' }]);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem', fontFamily:'Inter,sans-serif' }}>
      <div>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#1e293b' }}>Split Bill</h2>
        <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Divide an expense among multiple people</p>
      </div>

      {success && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', fontWeight:600, fontSize:13 }}>
          <CheckCircle2 size={15}/> Split transactions saved!
        </div>
      )}

      <form onSubmit={submit} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'1.4rem', display:'flex', flexDirection:'column', gap:16 }}>
        {error && <div style={{ padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, fontSize:13 }}>⚠ {error}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={LABEL}>Total Amount (₹)</label>
            <input style={FIELD} type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" onFocus={focus} onBlur={blur} required/>
          </div>
          <div>
            <label style={LABEL}>Date</label>
            <input style={FIELD} type="date" value={date} onChange={e=>setDate(e.target.value)} onFocus={focus} onBlur={blur} required/>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={LABEL}>Description</label>
            <input style={FIELD} type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Dinner" onFocus={focus} onBlur={blur} required/>
          </div>
          <div>
            <label style={LABEL}>Category</label>
            <select style={FIELD} value={catId} onChange={e=>setCatId(e.target.value)} onFocus={focus} onBlur={blur} required>
              <option value="">Select…</option>
              {categories.filter(c=>c.type==='expense').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Running total */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:13 }}>
            <span style={{ color:'#64748b' }}>Assigned: </span><strong style={{ color:'#1e293b' }}>₹{totalAssigned.toFixed(2)}</strong>
            <span style={{ color:'#64748b', marginLeft:16 }}>Remaining: </span>
            <strong style={{ color: remaining<0?'#ef4444':remaining===0?'#10b981':'#f59e0b' }}>₹{remaining.toFixed(2)}</strong>
          </div>
          <button type="button" onClick={equalSplit} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #c7d2fe', background:'#eef2ff', color:'#6366f1', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Equal Split
          </button>
        </div>

        {/* Participants */}
        <div>
          <label style={LABEL}>Participants</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {participants.map((p,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 130px 36px', gap:8 }}>
                <input style={FIELD} type="text" value={p.name} onChange={e=>updateRow(i,'name',e.target.value)} placeholder={`Person ${i+1}`} onFocus={focus} onBlur={blur}/>
                <input style={FIELD} type="number" step="0.01" value={p.amount} onChange={e=>updateRow(i,'amount',e.target.value)} placeholder="0.00" onFocus={focus} onBlur={blur}/>
                <button type="button" onClick={()=>removeRow(i)} disabled={participants.length<=2} style={{ height:42, borderRadius:8, border:'1px solid #fee2e2', background:'#fef2f2', color:'#ef4444', cursor:participants.length<=2?'not-allowed':'pointer', opacity:participants.length<=2?.4:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} style={{ marginTop:8, display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={12}/> Add Person
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" disabled={submitting} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', opacity:submitting?.6:1 }}>
            {submitting ? 'Saving…' : 'Create Split'}
          </button>
        </div>
      </form>
    </div>
  );
}
