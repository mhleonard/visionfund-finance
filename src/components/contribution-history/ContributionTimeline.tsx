
import { useState } from 'react';
import { YearGroup, Goal } from './types';
import { YearSection } from './YearSection';

interface ContributionTimelineProps {
  yearGroups: YearGroup[];
  goal: Goal;
}

export const ContributionTimeline = ({ yearGroups, goal }: ContributionTimelineProps) => {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  return (
    <div className="space-y-4">
      {yearGroups.map((yearGroup) => (
        <YearSection
          key={yearGroup.year}
          yearGroup={yearGroup}
          goal={goal}
          isExpanded={expandedYears.has(yearGroup.year)}
          onToggle={() => toggleYear(yearGroup.year)}
        />
      ))}
    </div>
  );
};
