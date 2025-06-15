
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/financialCalculations';
import { YearGroup, Goal } from './types';
import { MonthCard } from './MonthCard';

interface YearSectionProps {
  yearGroup: YearGroup;
  goal: Goal;
  isExpanded: boolean;
  onToggle: () => void;
}

export const YearSection = ({ yearGroup, goal, isExpanded, onToggle }: YearSectionProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
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
            {yearGroup.months.map((month) => (
              <MonthCard 
                key={month.month}
                month={month}
                goal={goal}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
