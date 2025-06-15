
interface WelcomeSectionProps {
  userName: string;
}

export const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
      <p className="text-gray-600 dark:text-gray-400">Track your financial goals and watch your dreams become reality.</p>
    </div>
  );
};
