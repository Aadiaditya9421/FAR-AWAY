// src/features/leaderboard/TopicPillGroup.jsx
import React from 'react';

const TOPICS = ['DSA', 'WebDev', 'Backend', 'React'];
const ICONS  = { DSA: '🔗', WebDev: '🎨', Backend: '⚙️', React: '⚛️' };

export default function TopicPillGroup({ active, onChange }) {
  return (
    <div className="pill-group">
      {TOPICS.map(topic => (
        <button
          key={topic}
          onClick={() => onChange(topic)}
          className={active === topic ? 'pill-tab-active' : 'pill-tab-idle'}
        >
          <span className="mr-1">{ICONS[topic]}</span>
          {topic}
        </button>
      ))}
    </div>
  );
}
