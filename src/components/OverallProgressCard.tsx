
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
    <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0 mx-4 sm:mx-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-left text-lg sm:text-xl">Overall Progress</CardTitle>
        <CardDescription className="text-blue-100 text-left text-sm sm:text-base">
          Your journey to financial freedom
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div className="text-left">
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
              <p className="text-xs sm:text-sm text-blue-100">of {formatCurrency(totalGoalsValue)} total</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold">{Math.round(overallProgress)}%</p>
              <p className="text-xs sm:text-sm text-blue-100">Complete</p>
            </div>
          </div>
          <Progress value={overallProgress} className="bg-blue-500/30 [&>div]:bg-white h-2 sm:h-3" />
        </div>
      </CardContent>
    </Card>
  );
};
