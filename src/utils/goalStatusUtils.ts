
import type { GoalWithCalculations } from '@/types/goal';

export const getStatusColor = (status: GoalWithCalculations['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'ahead':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'behind':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
  }
};

export const getStatusText = (status: GoalWithCalculations['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'On Track';
    case 'ahead':
      return 'Ahead of Schedule';
    case 'behind':
      return 'Behind Schedule';
    default:
      return 'Unknown';
  }
};
