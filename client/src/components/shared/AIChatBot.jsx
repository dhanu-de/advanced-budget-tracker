import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { sendMessageToGemini, buildFinancialContext } from '../../services/geminiService';

const QUICK = [
  '📊 Analyze my spending',
  '🎯 Am I saving enough?',
  '💸 Where can I cut costs?',
  '📈 How to reach my goals faster?',
  '🏦 Give me a budget plan',
];

export default function AIChatBot({ transactions = [], categories = [], goals = [] }) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState('');
  const [messages, setMessages] = useState([{ role:'model', text:'Hi! I\'m your BudgetFlow AI advisor powered by Groq. Ask me anything about your finances! 💰' }]);
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(p => [...p, { role:'user', text:msg }]);
    setLoading(true);
    const ctx   = buildFinancialContext(transactions, categories, goals);
    const hist  = messages.slice(-10);
    const reply = await sendMessageToGemini(msg, ctx, hist);
    setMessages(p => [...p, { role:'model', text:reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position:'fixed', bottom:80, right:16, zIndex:50,
          width:52, height:52, borderRadius:'50%', border:'none',
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(99,102,241,.45)',
        }}>
        {open ? <X size={22}/> : <MessageCircle size={22}/>}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:144, right:16, zIndex:50,
          width: Math.min(window.innerWidth - 32, 360),
          height:480, background:'#fff', borderRadius:20, border:'1px solid #e2e8f0',
          boxShadow:'0 8px 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column', overflow:'hidden',
          fontFamily:'Inter,sans-serif',
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#4285f4,#5b6ff0)', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={16} color="#fff"/>
            </div>
            <div>
              <p style={{ color:'#fff', fontWeight:700, fontSize:14 }}>BudgetFlow AI</p>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>Powered by Gemini 2.0 Flash ✨</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:8 }}>
            {messages.map((m, i) => {
              const isAI = m.role === 'model';
              return (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-end', flexDirection: isAI?'row':'row-reverse' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: isAI?'linear-gradient(135deg,#6366f1,#8b5cf6)':'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {isAI ? <Bot size={13} color="#fff"/> : <User size={13} color="#fff"/>}
                  </div>
                  <div style={{
                    maxWidth:'75%', padding:'10px 13px', borderRadius:14, fontSize:13, lineHeight:1.55,
                    borderBottomLeftRadius: isAI?2:14,
                    borderBottomRightRadius: isAI?14:2,
                    background: isAI?'#f8fafc':'#6366f1',
                    color:      isAI?'#1e293b':'#fff',
                    border:     isAI?'1px solid #e2e8f0':'none',
                    whiteSpace:'pre-wrap',
                  }}>{m.text}</div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Bot size={13} color="#fff"/>
                </div>
                <div style={{ padding:'10px 14px', borderRadius:14, borderBottomLeftRadius:2, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', gap:4 }}>
                  {[0,150,300].map(d => <span key={d} style={{ width:7, height:7, borderRadius:'50%', background:'#6366f1', display:'inline-block', animation:'bounce 1s infinite', animationDelay:`${d}ms` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding:'0 12px 8px', display:'flex', gap:6, flexWrap:'wrap' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} style={{ padding:'5px 10px', borderRadius:20, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontSize:11, fontWeight:600, cursor:'pointer' }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'10px', borderTop:'1px solid #f1f5f9', display:'flex', gap:8 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder="Ask about your finances…"
              style={{ flex:1, padding:'9px 13px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', color:'#1e293b' }}
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}
            />
            <button onClick={() => send()} disabled={!input.trim()||loading} style={{ width:38, height:38, borderRadius:12, border:'none', background: input.trim()?'#6366f1':'#e2e8f0', color:'#fff', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </>
  );
}
