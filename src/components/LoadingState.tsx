
export const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
      </div>
    </div>
  );
};
