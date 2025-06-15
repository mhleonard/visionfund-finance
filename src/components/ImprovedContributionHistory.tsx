
import { ContributionHistoryProps } from './contribution-history/types';
import { generateMonthlyData } from './contribution-history/utils';
import { QuickStats } from './contribution-history/QuickStats';
import { ContributionTimeline } from './contribution-history/ContributionTimeline';

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
