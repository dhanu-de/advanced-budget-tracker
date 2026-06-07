import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import GoalForm from '../../components/forms/GoalForm';
import MemoForm from '../../components/forms/MemoForm';
import GoalContributionModal from '../../components/forms/GoalContributionModal';

const GoalsView = ({ goals = [], memos = [], addMemo, addGoal, contributeToGoal, categories = [] }) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [activeContributionGoal, setActiveContributionGoal] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Financial Goals & Planning Funds</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMemoForm(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Note
          </button>
          <button
            onClick={() => setShowGoalForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Goal
          </button>
        </div>
      </div>

      {showGoalForm && (
        <GoalForm addGoal={addGoal} onClose={() => setShowGoalForm(false)} />
      )}

      {showMemoForm && (
        <MemoForm categories={categories} addMemo={addMemo} onClose={() => setShowMemoForm(false)} />
      )}

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.saved / goal.target) * 100;
          return (
            <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-2">{goal.title}</h3>
              <p className="text-gray-500 text-sm mb-4">Target: ₹{goal.target.toFixed(2)}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Saved: ₹{goal.saved.toFixed(2)} / ₹{goal.target.toFixed(2)}
              </p>

              <button
                onClick={() => setActiveContributionGoal(goal.id)}
                className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add Contribution
              </button>
            </div>
          );
        })}
      </div>

      {/* MEMOS LIST */}
      {memos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Planning Notes</h3>
          <div className="space-y-3">
            {memos.map((memo) => (
              <div key={memo.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold">{memo.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{memo.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeContributionGoal && (
        <GoalContributionModal
          memoId={activeContributionGoal}
          contributeToGoal={contributeToGoal}
          onClose={() => setActiveContributionGoal(null)}
        />
      )}
    </div>
  );
};

export default GoalsView;
