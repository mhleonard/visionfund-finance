
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
import { formatCurrency } from '@/utils/financialCalculations';

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
  actual: number;
  projected: number;
  contribution?: number;
  isConfirmed?: boolean;
}

export const GoalProgressChart = ({ goal, contributions }: GoalProgressChartProps) => {
  const chartData = useMemo(() => {
    const startDate = new Date(goal.created_at);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    const data: ChartDataPoint[] = [];
    let currentAmount = goal.initial_amount || 0;
    let projectedAmount = goal.initial_amount || 0;
    
    // Create monthly data points from start to target date
    const currentDate = new Date(startDate);
    currentDate.setDate(1); // Start of month
    
    while (currentDate <= targetDate) {
      const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const monthDisplay = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Find contributions for this month
      const monthContributions = contributions.filter(c => 
        c.contribution_date.slice(0, 7) === monthKey
      );
      
      const monthlyContributionAmount = monthContributions.reduce((sum, c) => 
        c.is_confirmed ? sum + c.amount : sum, 0
      );
      
      // Update actual amount with confirmed contributions
      if (monthContributions.length > 0) {
        currentAmount += monthlyContributionAmount;
      }
      
      // Calculate projected amount (theoretical progress)
      const monthsFromStart = Math.max(0, 
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - startDate.getMonth())
      );
      
      const monthlyRate = (goal.expected_return_rate || 0) / 100 / 12;
      projectedAmount = (goal.initial_amount || 0) + 
        (goal.monthly_pledge * monthsFromStart);
      
      // Apply compound interest
      if (monthlyRate > 0) {
        projectedAmount = (goal.initial_amount || 0) * Math.pow(1 + monthlyRate, monthsFromStart) +
          goal.monthly_pledge * (Math.pow(1 + monthlyRate, monthsFromStart) - 1) / monthlyRate;
      }
      
      data.push({
        month: monthDisplay,
        actual: currentDate <= today ? currentAmount : null,
        projected: Math.min(projectedAmount, goal.target_amount),
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
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          
          {data.contribution && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  data.isConfirmed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
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
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={payload.isConfirmed ? '#10b981' : '#f59e0b'}
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
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            label={{ value: "Target", position: "right" }}
          />
          
          {/* Projected progress area */}
          <Area
            type="monotone"
            dataKey="projected"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#projectedGradient)"
            strokeDasharray="5 5"
          />
          
          {/* Actual progress area */}
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
