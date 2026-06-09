import React, { useState } from 'react';
import { Plus, Upload, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import TransactionForm from '../../components/forms/TransactionForm';
import { useRef } from 'react';

const C = {
  surface:'#0d1526', raised:'#111e33', hover:'#172238', border:'#1a2d47', borderHi:'#233d5e',
  txt:'#dce8f5', txt2:'#7a98b8', txt3:'#3f5977',
  accent:'#5b6ff0', green:'#22d3a0', red:'#f05b7c', amber:'#f0a533',
};

const TransactionView = ({ transactions, categories, addTransaction, deleteTransaction }) => {
  const [showForm,    setShowForm]    = useState(false);
  const [filterType,  setFilterType]  = useState('all');
  const fileInputRef = useRef(null);

  const filtered = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return;
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idxDate = header.findIndex(h => ['date','transaction date'].includes(h));
    const idxDesc = header.findIndex(h => ['description','details','memo'].includes(h));
    const idxAmt  = header.findIndex(h => ['amount','amt','value'].includes(h));
    for (let i = 1; i < lines.length; i++) {
      const cols = []; let cur=''; let inQ=false;
      for (const ch of lines[i]) {
        if (ch==='"') { inQ=!inQ; continue; }
        if (ch===',' && !inQ) { cols.push(cur); cur=''; continue; }
        cur+=ch;
      }
      cols.push(cur);
      const desc = idxDesc >= 0 ? cols[idxDesc]?.trim() : '';
      const amt  = parseFloat((idxAmt >= 0 ? cols[idxAmt] : '').replace(/[^0-9.-]/g,''));
      if (!desc || isNaN(amt)) continue;
      await addTransaction({ amount: amt, description: desc, date: idxDate >= 0 ? cols[idxDate]?.trim() : new Date().toISOString().split('T')[0], category:'Others', type: amt < 0 ? 'expense' : 'expense' });
    }
    e.target.value = '';
  };

  const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); } catch { return '-'; } };
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color: C.txt }}>Transactions</h2>
          <p style={{ fontSize:13, color: C.txt3, marginTop:2 }}>{transactions.length} total records</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSVUpload} />
          <button onClick={() => fileInputRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:`1.5px solid ${C.borderHi}`, background: C.raised, color: C.amber, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Upload size={15} /> CSV
          </button>
          <button onClick={() => setShowForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#5b6ff0,#4254db)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <Plus size={15} /> Add Transaction
          </button>
        </div>
      </div>

      {showForm && <TransactionForm categories={categories} addTransaction={addTransaction} onClose={() => setShowForm(false)} />}

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8 }}>
        {[['all','All'], ['income','Income'], ['expense','Expense']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterType(val)} style={{
            padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s',
            background: filterType===val ? C.accent : C.raised,
            border: `1.5px solid ${filterType===val ? C.accent : C.borderHi}`,
            color: filterType===val ? '#fff' : C.txt2,
          }}>{label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background: C.raised }}>
                {['Date','Description','Category','Amount',''].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign: h==='Amount'?'right':'left', fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color: C.txt3, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const isIncome = t.type === 'income';
                const cat = categories.find(c => c.id === t.categoryId || c.name === t.category);
                return (
                  <tr key={t.id} style={{ borderTop:`1px solid ${C.border}`, transition:'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'13px 16px', fontSize:13, color: C.txt3, whiteSpace:'nowrap' }}>{fmtDate(t.date)}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <p style={{ fontSize:14, fontWeight:600, color: C.txt }}>{t.description || t.title}</p>
                      {t.notes && <p style={{ fontSize:12, color: C.txt3, marginTop:2 }}>{t.notes}</p>}
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600,
                        background: isIncome ? 'rgba(34,211,160,.1)' : 'rgba(240,91,124,.1)',
                        color: isIncome ? C.green : C.red,
                        border: `1px solid ${isIncome ? 'rgba(34,211,160,.25)' : 'rgba(240,91,124,.25)'}`,
                      }}>
                        {isIncome ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
                        {cat?.name || t.category || 'Others'}
                      </span>
                    </td>
                    <td style={{ padding:'13px 16px', textAlign:'right', fontSize:14, fontWeight:700, color: isIncome ? C.green : C.red, whiteSpace:'nowrap' }}>
                      {isIncome ? '+' : '−'}{fmt(t.amount)}
                    </td>
                    <td style={{ padding:'13px 16px', textAlign:'center' }}>
                      <button onClick={() => deleteTransaction(t.id)} style={{ background:'none', border:'none', color: C.txt3, cursor:'pointer', padding:4, borderRadius:6, transition:'color .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.color=C.red}
                        onMouseLeave={e=>e.currentTarget.style.color=C.txt3}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'3rem', textAlign:'center', color: C.txt3, fontSize:14 }}>
              No transactions found. Start by adding one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
