
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, getContributionStartDate } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  target_date: string;
  initial_amount: number;
  monthly_pledge: number;
  expected_return_rate: number;
  current_total: number;
  created_at: string;
}

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  is_confirmed: boolean;
  created_at: string;
}

interface ContributionHistoryProps {
  goal: Goal;
  contributions: Contribution[];
}

interface MonthlyData {
  month: string;
  monthDisplay: string;
  year: number;
  pledgedAmount: number;
  actualAmount: number;
  status: 'confirmed' | 'pending' | 'missed' | 'future' | 'initial';
  contributions: Contribution[];
  isInitialAmount?: boolean;
}

interface YearGroup {
  year: number;
  months: MonthlyData[];
  totalPledged: number;
  totalActual: number;
}

export const ImprovedContributionHistory = ({ goal, contributions }: ContributionHistoryProps) => {
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

  // Helper function to check if a contribution date falls within a specific month
  const isContributionInMonth = (contributionDate: string, year: number, month: number): boolean => {
    const contribution = new Date(contributionDate);
    return contribution.getFullYear() === year && contribution.getMonth() === month;
  };

  // Generate monthly data including initial amount and proper timeline
  const generateMonthlyData = (): YearGroup[] => {
    const monthlyData: MonthlyData[] = [];
    const contributionStartDate = getContributionStartDate(goal.created_at);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    // Add initial amount as first entry
    if (goal.initial_amount > 0) {
      const goalCreatedDate = new Date(goal.created_at);
      monthlyData.push({
        month: goalCreatedDate.toISOString().slice(0, 7),
        monthDisplay: goalCreatedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        year: goalCreatedDate.getFullYear(),
        pledgedAmount: goal.initial_amount,
        actualAmount: goal.initial_amount,
        status: 'initial',
        contributions: [],
        isInitialAmount: true
      });
    }
    
    // Generate monthly data from contribution start to target date
    const currentDate = new Date(contributionStartDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-based month index
      const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      // Find contributions for this specific month using proper date comparison
      const monthContributions = contributions.filter(c => 
        isContributionInMonth(c.contribution_date, currentYear, currentMonth)
      );
      
      const actualAmount = monthContributions.reduce((sum, c) => 
        c.is_confirmed ? sum + c.amount : sum, 0
      );
      
      const hasUnconfirmed = monthContributions.some(c => !c.is_confirmed);
      
      let status: MonthlyData['status'];
      if (currentDate > today) {
        status = 'future';
      } else if (actualAmount > 0) {
        status = hasUnconfirmed ? 'pending' : 'confirmed';
      } else {
        status = 'missed';
      }
      
      monthlyData.push({
        month: monthKey,
        monthDisplay,
        year: currentYear,
        pledgedAmount: goal.monthly_pledge,
        actualAmount,
        status,
        contributions: monthContributions
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Group by year and sort chronologically
    const yearGroups = new Map<number, MonthlyData[]>();
    
    monthlyData.forEach(month => {
      if (!yearGroups.has(month.year)) {
        yearGroups.set(month.year, []);
      }
      yearGroups.get(month.year)!.push(month);
    });

    // Convert to array and sort by year ascending
    const sortedYearGroups: YearGroup[] = Array.from(yearGroups.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, months]) => {
        // Sort months within year chronologically
        const sortedMonths = months.sort((a, b) => a.month.localeCompare(b.month));
        
        const totalPledged = sortedMonths.reduce((sum, m) => sum + m.pledgedAmount, 0);
        const totalActual = sortedMonths.reduce((sum, m) => sum + m.actualAmount, 0);
        
        return {
          year,
          months: sortedMonths,
          totalPledged,
          totalActual
        };
      });

    return sortedYearGroups;
  };

  const yearGroups = generateMonthlyData();

  const getStatusIcon = (status: MonthlyData['status']) => {
    switch (status) {
      case 'initial':
        return '🏦';
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'missed':
        return '❌';
      case 'future':
        return '📅';
      default:
        return '';
    }
  };

  const getStatusColor = (status: MonthlyData['status']) => {
    switch (status) {
      case 'initial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'future':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: MonthlyData['status']) => {
    switch (status) {
      case 'initial':
        return 'Initial Amount';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'missed':
        return 'Missed';
      case 'future':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  // Calculate overall stats
  const totalConfirmed = contributions.filter(c => c.is_confirmed).reduce((sum, c) => sum + c.amount, 0);
  const totalWithInitial = totalConfirmed + (goal.initial_amount || 0);
  const overallProgressPercentage = Math.min(100, (totalWithInitial / goal.target_amount) * 100);

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-300">Total Saved</p>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(totalWithInitial)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Including {formatCurrency(goal.initial_amount || 0)} initial
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700 dark:text-blue-300">Monthly Contributions</p>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(totalConfirmed)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {contributions.filter(c => c.is_confirmed).length} confirmed
          </p>
        </div>
        
        <div className={cn(
          "p-4 rounded-lg border",
          overallProgressPercentage >= 75
            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
            : overallProgressPercentage >= 50
            ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
            : "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800"
        )}>
          <p className={cn(
            "text-sm mb-2",
            overallProgressPercentage >= 75 ? "text-green-700 dark:text-green-300" : 
            overallProgressPercentage >= 50 ? "text-blue-700 dark:text-blue-300" :
            "text-yellow-700 dark:text-yellow-300"
          )}>
            Overall Progress
          </p>
          <p className={cn(
            "text-2xl font-bold",
            overallProgressPercentage >= 75 ? "text-green-900 dark:text-green-100" :
            overallProgressPercentage >= 50 ? "text-blue-900 dark:text-blue-100" :
            "text-yellow-900 dark:text-yellow-100"
          )}>
            {Math.round(overallProgressPercentage)}%
          </p>
          <p className={cn(
            "text-xs",
            overallProgressPercentage >= 75 ? "text-green-600 dark:text-green-400" :
            overallProgressPercentage >= 50 ? "text-blue-600 dark:text-blue-400" :
            "text-yellow-600 dark:text-yellow-400"
          )}>
            {formatCurrency(totalWithInitial)} of {formatCurrency(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Year-based Timeline */}
      <div className="space-y-4">
        {yearGroups.map((yearGroup) => (
          <div key={yearGroup.year} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Collapsible open={expandedYears.has(yearGroup.year)} onOpenChange={() => toggleYear(yearGroup.year)}>
              <CollapsibleTrigger asChild>
                <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {expandedYears.has(yearGroup.year) ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {yearGroup.year}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {yearGroup.months.length} months
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(yearGroup.totalActual)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round((yearGroup.totalActual / goal.target_amount) * 100)}% of target
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                  {yearGroup.months.map((month) => {
                    const completionPercentage = month.pledgedAmount > 0 
                      ? Math.min(100, (month.actualAmount / month.pledgedAmount) * 100)
                      : 0;
                    
                    const targetProgressPercentage = (month.actualAmount / goal.target_amount) * 100;

                    return (
                      <div 
                        key={month.month}
                        className={cn(
                          "p-4 rounded-lg border hover:shadow-md transition-all duration-200",
                          month.isInitialAmount 
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStatusIcon(month.status)}</span>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {month.isInitialAmount ? 'Initial Deposit' : month.monthDisplay}
                              </h4>
                              <Badge className={cn("border text-xs", getStatusColor(month.status))}>
                                {getStatusText(month.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(month.actualAmount)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {Math.round(targetProgressPercentage * 100) / 100}% of target
                            </p>
                          </div>
                        </div>

                        {!month.isInitialAmount && month.status !== 'future' && (
                          <div className="space-y-2">
                            <Progress 
                              value={completionPercentage} 
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>{Math.round(completionPercentage)}% of pledge</span>
                              {month.contributions.length > 0 && (
                                <span>{month.contributions.length} contribution(s)</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Show date for initial deposit */}
                        {month.isInitialAmount && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Initial Contribution:</p>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(goal.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                    Initial Amount
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(month.actualAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {month.contributions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Individual Contributions:</p>
                            <div className="space-y-1">
                              {month.contributions.map((contribution) => (
                                <div key={contribution.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {new Date(contribution.contribution_date).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className={cn(
                                      "px-2 py-1 rounded text-xs",
                                      contribution.is_confirmed 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    )}>
                                      {contribution.is_confirmed ? 'Confirmed' : 'Pending'}
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(contribution.amount)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  );
};
