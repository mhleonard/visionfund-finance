
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartDataPoint {
  month: string;
  actual: number;
  projected: number;
  target: number;
}

interface ProgressChartProps {
  data: ChartDataPoint[];
  targetAmount: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ProgressChart = ({ data, targetAmount }: ProgressChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Timeline</CardTitle>
        <CardDescription>
          Visual representation of your progress vs projections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target line */}
              <Line
                type="monotone"
                dataKey="target"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
              
              {/* Projected area */}
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#projectedGradient)"
                name="Projected"
              />
              
              {/* Actual progress area */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Actual Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Projected Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-red-500 rounded-full"></div>
            <span className="text-gray-600">Target Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Generate sample chart data
export const generateChartData = (
  targetAmount: number,
  initialAmount: number,
  monthlyPledge: number,
  currentMonth: number = 6
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  let actualAmount = initialAmount;
  let projectedAmount = initialAmount;
  
  for (let i = 0; i < 12; i++) {
    if (i <= currentMonth) {
      // Actual data with some variation
      actualAmount += monthlyPledge + (Math.random() - 0.5) * 100;
    }
    
    // Projected data (smooth progression)
    projectedAmount += monthlyPledge;
    
    data.push({
      month: months[i],
      actual: i <= currentMonth ? actualAmount : 0,
      projected: projectedAmount,
      target: targetAmount
    });
  }
  
  return data;
};
