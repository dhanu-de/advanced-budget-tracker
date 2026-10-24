import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Search, Upload, X, Check } from 'lucide-react';

const FIELD = {
  width:'100%', padding:'10px 13px', border:'1.5px solid #e2e8f0', borderRadius:10,
  fontSize:14, color:'#1e293b', background:'#fff', fontFamily:'Inter,sans-serif', outline:'none',
};
const LABEL = { display:'block', fontSize:12, fontWeight:600, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em' };

function AddTransactionModal({ categories, onSave, onClose }) {
  const [type,     setType]     = useState('expense');
  const [amount,   setAmount]   = useState('');
  const [desc,     setDesc]     = useState('');
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [catId,    setCatId]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [error,    setError]    = useState('');

  const filteredCats = categories.filter(c => c.type === type);

  const submit = async e => {
    e.preventDefault(); setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (!desc.trim())     { setError('Enter a description'); return; }
    if (!catId)           { setError('Select a category'); return; }
    const cat = categories.find(c => c.id === Number(catId));
    await onSave({ amount: amt, description: desc.trim(), date, categoryId: Number(catId), category: cat?.name||'Others', type, notes });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'1.5rem', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>Add Transaction</h3>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', borderRadius:8, padding:6, cursor:'pointer', color:'#64748b' }}><X size={16}/></button>
        </div>

        {error && <div style={{ padding:'8px 12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, fontSize:13, marginBottom:14 }}>⚠ {error}</div>}

        {/* Type toggle */}
        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:10, padding:3, marginBottom:18 }}>
          {['expense','income'].map(t => (
            <button key={t} onClick={() => { setType(t); setCatId(''); }} style={{
              flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:13, fontFamily:'Inter,sans-serif',
              background: type===t ? (t==='income'?'#10b981':'#ef4444') : 'transparent',
              color:      type===t ? '#fff' : '#64748b',
            }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        <form onSubmit={submit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={LABEL}>Amount (₹)</label>
              <input style={FIELD} type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" autoFocus
                onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>
            <div>
              <label style={LABEL}>Date</label>
              <input style={FIELD} type="date" value={date} onChange={e=>setDate(e.target.value)}
                onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={LABEL}>Description</label>
            <input style={FIELD} type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Lunch at Café Coffee Day"
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={LABEL}>Category</label>
            <select style={FIELD} value={catId} onChange={e=>setCatId(e.target.value)}
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}>
              <option value="">Select category</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={LABEL}>Notes (optional)</label>
            <textarea style={{ ...FIELD, resize:'vertical', minHeight:60 }} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any extra details…"
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background:`linear-gradient(135deg,#6366f1,#8b5cf6)`, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TransactionView({ transactions = [], categories = [], addTransaction, deleteTransaction }) {
  const [showModal, setShowModal] = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [success,   setSuccess]   = useState(false);

  const filtered = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search && !(t.description||t.title||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = async tx => {
    await addTransaction(tx);
    setSuccess(true); setTimeout(() => setSuccess(false), 2500);
  };

  const handleCSV = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return;
    const h = lines[0].split(',').map(s => s.trim().toLowerCase());
    const iDate = h.findIndex(x => x.includes('date'));
    const iDesc = h.findIndex(x => ['description','details','memo','narration'].some(k=>x.includes(k)));
    const iAmt  = h.findIndex(x => x.includes('amount') || x === 'amt');
    for (let i = 1; i < lines.length; i++) {
      const cols = []; let cur=''; let inQ=false;
      for (const ch of lines[i]) {
        if (ch==='"') { inQ=!inQ; continue; }
        if (ch===',' && !inQ) { cols.push(cur); cur=''; continue; }
        cur+=ch;
      }
      cols.push(cur);
      const desc = iDesc >= 0 ? cols[iDesc]?.trim() : '';
      const amt  = parseFloat((iAmt>=0 ? cols[iAmt] : '').replace(/[^0-9.-]/g,''));
      if (!desc || isNaN(amt)) continue;
      await addTransaction({ amount: Math.abs(amt), description: desc, date: iDate>=0?cols[iDate]?.trim():new Date().toISOString().split('T')[0], category:'Others', categoryId:10, type:'expense' });
    }
    e.target.value = '';
  };

  const cardStyle = { background:'#fff', borderRadius:14, border:'1px solid #e2e8f0' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem', fontFamily:'Inter,sans-serif' }}>

      {showModal && <AddTransactionModal categories={categories} onSave={handleSave} onClose={() => setShowModal(false)}/>}

      {success && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', fontWeight:600, fontSize:13 }}>
          <Check size={15}/> Transaction saved!
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#1e293b' }}>Transactions</h2>
          <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{transactions.length} total records</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <label style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#f59e0b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Upload size={14}/> Import CSV
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV}/>
          </label>
          <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <Plus size={14}/> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {[['all','All'],['income','Income'],['expense','Expense']].map(([val,lbl]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding:'6px 14px', borderRadius:20, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer',
            borderColor: filter===val?'#6366f1':'#e2e8f0',
            background:  filter===val?'#6366f1':'#fff',
            color:       filter===val?'#fff':'#64748b',
          }}>{lbl}</button>
        ))}
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <Search size={14} color="#94a3b8" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}/>
          <input style={{ ...FIELD, paddingLeft:30, padding:'7px 12px 7px 30px', fontSize:13 }} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Date','Description','Category','Amount',''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign: h==='Amount'?'right':'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const isInc = t.type === 'income';
                const cat   = categories.find(c => c.id===t.categoryId || c.name===t.category);
                return (
                  <tr key={t.id} style={{ borderTop:'1px solid #f1f5f9' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'11px 14px', color:'#94a3b8', fontSize:12, whiteSpace:'nowrap' }}>{new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                    <td style={{ padding:'11px 14px' }}>
                      <p style={{ fontWeight:600, color:'#1e293b' }}>{t.description||t.title}</p>
                      {t.notes && <p style={{ fontSize:11, color:'#94a3b8' }}>{t.notes}</p>}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600,
                        background: isInc?'#f0fdf4':'#fef2f2', color: isInc?'#16a34a':'#dc2626',
                        border: `1px solid ${isInc?'#bbf7d0':'#fecaca'}`,
                      }}>
                        {isInc?<ArrowUp size={10}/>:<ArrowDown size={10}/>}
                        {cat?.name||t.category||'Others'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', textAlign:'right', fontWeight:700, color: isInc?'#16a34a':'#dc2626', whiteSpace:'nowrap' }}>
                      {isInc?'+':'−'}₹{Number(t.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding:'11px 14px', textAlign:'center' }}>
                      <button onClick={() => deleteTransaction(t.id)} style={{ border:'none', background:'none', color:'#cbd5e1', cursor:'pointer', borderRadius:6, padding:4 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                        onMouseLeave={e=>e.currentTarget.style.color='#cbd5e1'}>
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'2.5rem', textAlign:'center', color:'#94a3b8', fontSize:14 }}>
              {transactions.length === 0 ? 'No transactions yet. Add your first one!' : 'No results match your filter.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
