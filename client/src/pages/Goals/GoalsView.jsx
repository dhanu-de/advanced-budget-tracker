import React, { useState, lazy, Suspense } from 'react';
import { Plus } from 'lucide-react';
import GoalForm from '../../components/forms/GoalForm';
import Skeleton3D from '../../components/3d/Skeleton3D';

const GoalVessel = lazy(() => import('../../components/3d/GoalVessel'));

const C = {
  surface: '#0d1526', raised: '#111e33', border: '#1a2d47', borderHi: '#233d5e',
  txt: '#dce8f5', txt2: '#7a98b8', txt3: '#3f5977',
  accent: '#5b6ff0', green: '#22d3a0', red: '#f05b7c', violet: '#9b7bf0', amber: '#f0a533',
};

const GoalsView = ({ goals = [], memos = [], addMemo, addGoal, contributeToGoal }) => {
  const [showGoalForm, setShowGoalForm] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.txt }}>Savings Goals</h2>
          <p style={{ fontSize: 13, color: C.txt3, marginTop: 2 }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''} · {goals.filter(g => Number(g.saved) >= Number(g.target)).length} completed
          </p>
        </div>
        <button
          onClick={() => setShowGoalForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#9b7bf0,#7c5ce0)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={15} /> New Goal
        </button>
      </div>

      {showGoalForm && <GoalForm addGoal={addGoal} onClose={() => setShowGoalForm(false)} />}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
          <p style={{ color: C.txt2, fontWeight: 600, marginBottom: 6 }}>No goals yet</p>
          <p style={{ color: C.txt3, fontSize: 13 }}>Create your first savings goal to start tracking progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(goal => (
            <Suspense key={goal.id} fallback={<Skeleton3D height={280} />}>
              <GoalVessel
                goal={goal}
                onContribute={contributeToGoal}
              />
            </Suspense>
          ))}
        </div>
      )}

      {/* Planning Notes */}
      {memos.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.3rem' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: '0.9rem' }}>Planning Notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memos.map(m => (
              <div key={m.id} style={{ background: C.raised, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.borderHi}` }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.txt }}>{m.title}</p>
                {m.content && <p style={{ fontSize: 13, color: C.txt3, marginTop: 3 }}>{m.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
