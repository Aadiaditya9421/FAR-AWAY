// src/features/dashboard/LearningPath.jsx
import React from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  IconBook, IconClock, IconCoin, IconCode,
  IconGlobe, IconServer, IconAtom,
} from '../../components/ui/Icons';

export default function LearningPath({ assessments, onStart, onViewAll }) {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <IconBook size={16} className="text-accentIndigo" />
          <h4 className="font-display font-semibold text-sm text-textPrimary">
            Recommended Learning Path
          </h4>
        </div>
        <Button variant="secondary" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {assessments.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 border border-borderColor rounded-lg
                       bg-bgSecondary/40 hover:bg-bgCardHover hover:border-borderHover
                       transition-all duration-150 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-accentIndigo/10 border border-accentIndigo/20
                              flex items-center justify-center text-accentIndigo flex-shrink-0">
                {item.topic === 'DSA' ? <IconCode size={15} /> :
                 item.topic === 'WebDev' ? <IconGlobe size={15} /> :
                 item.topic === 'Backend' ? <IconServer size={15} /> :
                 <IconAtom size={15} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={item.difficulty}>{item.difficulty}</Badge>
                  <strong className="text-xs text-textPrimary truncate font-display group-hover:text-accentIndigo transition-colors">
                    {item.title}
                  </strong>
                </div>
                <div className="text-[10px] text-textMuted flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <IconClock size={11} />
                    {item.duration} min
                  </span>
                  <span className="flex items-center gap-1 text-accentAmber font-semibold">
                    <IconCoin size={11} />
                    {item.coinsReward} coins
                  </span>
                </div>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => onStart(item)} className="ml-3 flex-shrink-0">
              Start
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
