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
  contribution?: number;
  isConfirmed?: boolean;
  isCurrentMonth?: boolean;
  dayOfMonth: number;
}

export const EnhancedGoalProgressChart = ({ goal, contributions }: EnhancedGoalProgressChartProps) => {
  const chartData = useMemo(() => {
    const goalCreatedDate = new Date(goal.created_at);
    const contributionStartDate = getContributionStartDate(goal.created_at);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    const data: ChartDataPoint[] = [];
    let actualCumulative = goal.initial_amount || 0;
    
    // Add initial amount as first data point if it exists
    if (goal.initial_amount > 0) {
      data.push({
        month: goalCreatedDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        date: new Date(goalCreatedDate),
        actual: goal.initial_amount,
        projected: goal.initial_amount,
        target: goal.target_amount,
        contribution: goal.initial_amount,
        isConfirmed: true,
        isCurrentMonth: false,
        dayOfMonth: goalCreatedDate.getDate()
      });
    }
    
    // Create monthly data points from contribution start to target date
    const currentDate = new Date(contributionStartDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Check if this is the current month
      const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                            currentDate.getMonth() === today.getMonth();
      
      // Find contributions for this month
      const monthContributions = contributions.filter(c => {
        const contributionDate = new Date(c.contribution_date);
        return contributionDate.getFullYear() === currentDate.getFullYear() && 
               contributionDate.getMonth() === currentDate.getMonth();
      });
      
      const monthlyContributionAmount = monthContributions.reduce((sum, c) => 
        c.is_confirmed ? sum + c.amount : sum, 0
      );
      
      // Update actual amount with confirmed contributions for past/current months
      if (currentDate <= today && monthContributions.length > 0) {
        actualCumulative += monthlyContributionAmount;
      }
      
      // Calculate projected amount with compound interest
      const monthsFromStart = Math.max(0, 
        (currentDate.getFullYear() - contributionStartDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - contributionStartDate.getMonth()) + 1
      );
      
      const monthlyRate = (goal.expected_return_rate || 0) / 100 / 12;
      let projectedAmount = goal.initial_amount || 0;
      
      // Apply compound interest growth
      const monthsFromGoalCreation = Math.max(0,
        (currentDate.getFullYear() - goalCreatedDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - goalCreatedDate.getMonth()) + 1
      );
      
      if (monthlyRate > 0) {
        // Future value of initial amount with compound interest
        const futureValueInitial = (goal.initial_amount || 0) * Math.pow(1 + monthlyRate, monthsFromGoalCreation);
        
        // Future value of monthly contributions
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
        date: new Date(currentDate),
        actual: currentDate <= today ? actualCumulative : null,
        projected: Math.min(projectedAmount, goal.target_amount * 1.5), // Cap projection
        target: goal.target_amount,
        contribution: monthlyContributionAmount > 0 ? monthlyContributionAmount : undefined,
        isConfirmed: monthContributions.some(c => c.is_confirmed),
        isCurrentMonth,
        dayOfMonth: currentDate.getDate()
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  }, [goal, contributions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{label}</p>
          
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              if (entry.dataKey === 'target') return null; // Don't show target in tooltip
              
              const color = entry.dataKey === 'actual' ? '#10b981' : '#3b82f6';
              const label = entry.dataKey === 'actual' ? 'Actual Progress' : 'Projected Progress';
              
              return (
                <div key={index} className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {label}:
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {entry.value ? formatCurrency(entry.value) : 'N/A'}
                  </span>
                </div>
              );
            })}
          </div>
          
          {data.contribution && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    data.isConfirmed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {data.isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(data.contribution)}
                </span>
              </div>
            </div>
          )}
          
          {data.isCurrentMonth && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Current Month
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
    
    if (payload.isCurrentMonth) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={6}
          fill="#f97316"
          stroke="#fff"
          strokeWidth={3}
          className="animate-pulse drop-shadow-lg"
        />
      );
    }
    
    if (payload.contribution) {
      const color = payload.isConfirmed ? '#10b981' : '#f59e0b';
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={4}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          className="drop-shadow-sm hover:r-6 transition-all duration-200"
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
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            opacity={0.3}
            horizontal={true}
            vertical={false}
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
          
          {/* Target line - red horizontal line */}
          <ReferenceLine 
            y={goal.target_amount} 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="8 4" 
            label={{ 
              value: `🎯 Target: ${formatCurrency(goal.target_amount)}`, 
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
          
          {/* Projected progress line - blue dashed */}
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
          
          {/* Actual progress line - green solid */}
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
