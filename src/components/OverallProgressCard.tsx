
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OverallProgressCardProps {
  totalCurrentValue: number;
  totalGoalsValue: number;
  overallProgress: number;
  formatCurrency: (amount: number) => string;
}

export const OverallProgressCard = ({ 
  totalCurrentValue, 
  totalGoalsValue, 
  overallProgress, 
  formatCurrency 
}: OverallProgressCardProps) => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
      <CardHeader>
        <CardTitle className="text-white">Overall Progress</CardTitle>
        <CardDescription className="text-blue-100">
          Your journey to financial freedom
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
              <p className="text-sm text-blue-100">of {formatCurrency(totalGoalsValue)} total</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
              <p className="text-sm text-blue-100">Complete</p>
            </div>
          </div>
          <Progress value={overallProgress} className="bg-blue-500/30 [&>div]:bg-white" />
        </div>
      </CardContent>
    </Card>
  );
};
