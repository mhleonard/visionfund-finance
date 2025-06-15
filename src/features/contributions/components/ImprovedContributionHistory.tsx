import { ContributionHistoryProps } from '../types';
import { generateMonthlyData } from '../utils';
import { QuickStats } from './QuickStats';
import { ContributionTimeline } from './ContributionTimeline';

export const ImprovedContributionHistory = ({ goal, contributions }: ContributionHistoryProps) => {
  const yearGroups = generateMonthlyData(goal, contributions);

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Stats */}
      <QuickStats goal={goal} contributions={contributions} />

      {/* Year-based Timeline */}
      <ContributionTimeline yearGroups={yearGroups} goal={goal} />
    </div>
  );
};
