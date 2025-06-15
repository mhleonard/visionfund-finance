
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { formatCurrency, getContributionStartDate } from '@/utils/financialCalculations';

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

interface GoalProgressChartProps {
  goal: Goal;
  contributions: Contribution[];
}

interface ChartDataPoint {
  month: string;
  actual: number | null;
  projected: number;
  contribution?: number;
  isConfirmed?: boolean;
  isInitialAmount?: boolean;
}

export const GoalProgressChart = ({ goal, contributions }: GoalProgressChartProps) => {
  const chartData = useMemo(() => {
    const goalCreatedDate = new Date(goal.created_at);
    const contributionStartDate = getContributionStartDate(goal.created_at);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    const data: ChartDataPoint[] = [];
    let actualCumulative = goal.initial_amount || 0;
    
    // Add initial amount as first data point
    if (goal.initial_amount > 0) {
      data.push({
        month: goalCreatedDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        actual: goal.initial_amount,
        projected: goal.initial_amount,
        contribution: goal.initial_amount,
        isConfirmed: true,
        isInitialAmount: true
      });
    }
    
    // Create monthly data points from contribution start to target date
    const currentDate = new Date(contributionStartDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Find contributions for this exact month - fix date matching
      const monthContributions = contributions.filter(c => {
        const contributionDate = new Date(c.contribution_date);
        const contributionMonth = contributionDate.toISOString().slice(0, 7);
        return contributionMonth === monthKey;
      });
      
      const monthlyContributionAmount = monthContributions.reduce((sum, c) => 
        c.is_confirmed ? sum + c.amount : sum, 0
      );
      
      // Update actual amount with confirmed contributions for past/current months
      if (currentDate <= today && monthContributions.length > 0) {
        actualCumulative += monthlyContributionAmount;
      }
      
      // Calculate projected amount with proper compound interest
      const monthsFromStart = Math.max(0, 
        (currentDate.getFullYear() - contributionStartDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - contributionStartDate.getMonth()) + 1
      );
      
      const monthlyRate = (goal.expected_return_rate || 0) / 100 / 12;
      let projectedAmount = goal.initial_amount || 0;
      
      // Apply compound interest growth from goal creation to this month
      const monthsFromGoalCreation = Math.max(0,
        (currentDate.getFullYear() - goalCreatedDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - goalCreatedDate.getMonth()) + 1
      );
      
      if (monthlyRate > 0) {
        // Future value of initial amount with compound interest
        const futureValueInitial = (goal.initial_amount || 0) * Math.pow(1 + monthlyRate, monthsFromGoalCreation);
        
        // Future value of monthly contributions (only from contribution start date)
        const contributionMonths = Math.max(0, monthsFromStart);
        const futureValueContributions = contributionMonths > 0 
          ? goal.monthly_pledge * (Math.pow(1 + monthlyRate, contributionMonths) - 1) / monthlyRate
          : 0;
        
        projectedAmount = futureValueInitial + futureValueContributions;
      } else {
        // Simple addition without compound interest
        projectedAmount = (goal.initial_amount || 0) + (goal.monthly_pledge * Math.max(0, monthsFromStart));
      }
      
      data.push({
        month: monthDisplay,
        actual: currentDate <= today ? actualCumulative : null,
        projected: Math.min(projectedAmount, goal.target_amount * 1.2), // Cap at 120% of target
        contribution: monthlyContributionAmount > 0 ? monthlyContributionAmount : undefined,
        isConfirmed: monthContributions.some(c => c.is_confirmed)
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  }, [goal, contributions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.dataKey === 'actual' ? 'Actual' : 'Projected'}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.value ? formatCurrency(entry.value) : 'N/A'}
              </span>
            </div>
          ))}
          
          {data.contribution && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  data.isInitialAmount
                    ? 'bg-blue-100 text-blue-800'
                    : data.isConfirmed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.isInitialAmount ? '🏦 Initial' : data.isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(data.contribution)}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.contribution) {
      const color = payload.isInitialAmount ? '#3b82f6' : payload.isConfirmed ? '#10b981' : '#f59e0b';
      return (
        <circle
          cx={cx}
          cy={cy}
          r={payload.isInitialAmount ? 8 : 6}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          className="drop-shadow-sm hover:r-8 transition-all duration-200"
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Target line */}
          <ReferenceLine 
            y={goal.target_amount} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label={{ 
              value: `Target: ${formatCurrency(goal.target_amount)}`, 
              position: "topLeft",
              offset: 10
            }}
          />
          
          {/* Projected progress area - behind actual */}
          <Area
            type="monotone"
            dataKey="projected"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#projectedGradient)"
            strokeDasharray="5 5"
          />
          
          {/* Actual progress area - in front */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#actualGradient)"
            dot={<CustomDot />}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
