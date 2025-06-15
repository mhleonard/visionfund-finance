
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

interface EnhancedGoalProgressChartProps {
  goal: Goal;
  contributions: Contribution[];
}

interface ChartDataPoint {
  month: string;
  monthYear: string;
  date: Date;
  actualSaved: number | null;
  projected: number;
  monthlyContribution: number;
  hasContribution: boolean;
  isCurrentMonth: boolean;
}

export const EnhancedGoalProgressChart = ({ goal, contributions }: EnhancedGoalProgressChartProps) => {
  const chartData = useMemo(() => {
    const goalCreatedDate = new Date(goal.created_at);
    const contributionStartDate = getContributionStartDate(goal.created_at);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    const data: ChartDataPoint[] = [];
    let runningTotal = goal.initial_amount || 0;
    
    // Start from goal creation date
    const currentDate = new Date(goalCreatedDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      const monthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                            currentDate.getMonth() === today.getMonth();
      
      // Find contributions for this month
      const monthContributions = contributions.filter(c => {
        const contributionDate = new Date(c.contribution_date);
        return contributionDate.getFullYear() === currentDate.getFullYear() && 
               contributionDate.getMonth() === currentDate.getMonth() &&
               c.is_confirmed;
      });
      
      const monthlyContributionAmount = monthContributions.reduce((sum, c) => sum + c.amount, 0);
      
      // Calculate projected amount for this month
      const monthsFromGoalCreation = Math.max(0,
        (currentDate.getFullYear() - goalCreatedDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - goalCreatedDate.getMonth())
      );
      
      const monthsFromContributionStart = Math.max(0,
        (currentDate.getFullYear() - contributionStartDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - contributionStartDate.getMonth())
      );
      
      const monthlyRate = (goal.expected_return_rate || 0) / 100 / 12;
      let projectedAmount = goal.initial_amount || 0;
      
      if (monthlyRate > 0) {
        // Future value of initial amount with compound interest
        const futureValueInitial = (goal.initial_amount || 0) * Math.pow(1 + monthlyRate, monthsFromGoalCreation);
        
        // Future value of regular contributions
        const contributionPeriods = Math.max(0, monthsFromContributionStart);
        const futureValueContributions = contributionPeriods > 0 
          ? goal.monthly_pledge * (Math.pow(1 + monthlyRate, contributionPeriods) - 1) / monthlyRate
          : 0;
        
        projectedAmount = futureValueInitial + futureValueContributions;
      } else {
        // Simple addition without compound interest
        const contributionPeriods = Math.max(0, monthsFromContributionStart);
        projectedAmount = (goal.initial_amount || 0) + (goal.monthly_pledge * contributionPeriods);
      }
      
      // Update actual saved for past/current months
      if (currentDate <= today) {
        if (monthContributions.length > 0) {
          runningTotal += monthlyContributionAmount;
        }
      }
      
      data.push({
        month: monthDisplay,
        monthYear: monthYear,
        date: new Date(currentDate),
        actualSaved: currentDate <= today ? runningTotal : null,
        projected: Math.min(projectedAmount, goal.target_amount * 1.5), // Cap projection
        monthlyContribution: monthlyContributionAmount,
        hasContribution: monthContributions.length > 0,
        isCurrentMonth
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  }, [goal, contributions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-64">
          <p className="font-bold text-gray-900 dark:text-white mb-3 text-center">{data.monthYear}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Projected:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.projected)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Contribution:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {data.monthlyContribution > 0 ? formatCurrency(data.monthlyContribution) : '$0.00'}
              </span>
            </div>
            
            {data.actualSaved !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Actual Saved:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.actualSaved)}
                </span>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`text-sm font-medium ${
                  data.hasContribution 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {data.hasContribution ? 'Contribution Made ✅' : 'No Contribution'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentPositionData = chartData.find(d => d.isCurrentMonth);

  return (
    <div className="w-full h-96 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            opacity={0.3}
          />
          
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
              return `$${value}`;
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Target line - Red dotted line */}
          <ReferenceLine 
            y={goal.target_amount} 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="8 4" 
            label={{ 
              value: `Target: ${formatCurrency(goal.target_amount)}`, 
              position: "top",
              style: { fontSize: '12px', fontWeight: 'bold', fill: '#ef4444' }
            }}
          />
          
          {/* Current position indicator */}
          {currentPositionData && (
            <ReferenceLine 
              x={currentPositionData.month}
              stroke="#f97316" 
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ 
                value: "Today", 
                position: "top",
                style: { fontSize: '11px', fontWeight: 'bold', fill: '#f97316' }
              }}
            />
          )}
          
          {/* Projected progress line */}
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            connectNulls={true}
          />
          
          {/* Actual progress line */}
          <Line
            type="monotone"
            dataKey="actualSaved"
            stroke="#10b981"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isCurrentMonth) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#f97316"
                    stroke="#fff"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                );
              }
              if (payload.hasContribution) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }
              return null;
            }}
            activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#fff' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Actual Saved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500 opacity-70" style={{ borderTop: '2px dashed #3b82f6' }}></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Projected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500 opacity-70" style={{ borderTop: '2px dashed #ef4444' }}></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Target</span>
          </div>
        </div>
      </div>
    </div>
  );
};
