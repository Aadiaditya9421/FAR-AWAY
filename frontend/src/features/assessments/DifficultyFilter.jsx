// src/features/assessments/DifficultyFilter.jsx

const LEVELS = ['all', 'easy', 'medium', 'hard'];
const ICONS  = { all: '🎯', easy: '🟢', medium: '🟡', hard: '🔴' };

export default function DifficultyFilter({ active, onChange }) {
  return (
    <div className="pill-group">
      {LEVELS.map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={active === level ? 'pill-tab-active' : 'pill-tab-idle'}
        >
          <span className="mr-1">{ICONS[level]}</span>
          {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  );
}
