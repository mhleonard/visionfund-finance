
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot
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
  date: Date;
  actual: number | null;
  projected: number;
  target: number;
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
    let actualCumulative = goal.initial_amount || 0;
    
    // Start from goal creation date
    const currentDate = new Date(goalCreatedDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
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
      
      // Update actual amount for past/current months only
      if (currentDate <= today && monthContributions.length > 0) {
        actualCumulative += monthlyContributionAmount;
      }
      
      // Calculate projected amount with compound interest
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
        // Future value of initial amount
        const futureValueInitial = (goal.initial_amount || 0) * Math.pow(1 + monthlyRate, monthsFromGoalCreation);
        
        // Future value of contributions (only from contribution start date)
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
      
      data.push({
        month: monthDisplay,
        date: new Date(currentDate),
        actual: currentDate <= today ? actualCumulative : null,
        projected: Math.min(projectedAmount, goal.target_amount * 1.2), // Cap projection
        target: goal.target_amount,
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
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              if (entry.dataKey === 'target') return null;
              
              const color = entry.dataKey === 'actual' ? '#10b981' : '#3b82f6';
              const label = entry.dataKey === 'actual' ? 'Actual' : 'Projected';
              
              return (
                <div key={index} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {label}:
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {entry.value ? formatCurrency(entry.value) : 'N/A'}
                  </span>
                </div>
              );
            })}
          </div>
          
          {data.hasContribution && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-xs text-green-600 dark:text-green-400">
                ✅ Contribution made this month
              </span>
            </div>
          )}
          
          {data.isCurrentMonth && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-xs text-orange-600 dark:text-orange-400">
                📍 Current month
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (payload.isCurrentMonth) {
      return (
        <Dot
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
        <Dot
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
          
          {/* Target line */}
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
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={3}
            dot={<CustomDot />}
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
            <span className="text-gray-700 dark:text-gray-300 font-medium">Actual Progress</span>
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
