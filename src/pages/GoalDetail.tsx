
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, DollarSign, TrendingUp, Calendar, Target, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGoals } from '@/hooks/useGoals';
import { getStatusColor, getStatusText } from '@/utils/goalStatusUtils';

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  is_confirmed: boolean;
  created_at: string;
}

import { EnhancedGoalProgressChart } from '@/components/EnhancedGoalProgressChart';
import { ImprovedContributionHistory } from '@/components/ImprovedContributionHistory';
import { FulfillPledgeDialog } from '@/components/FulfillPledgeDialog';
import { formatCurrency, getContributionStartDate } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { goals, loading } = useGoals();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showFulfillPledge, setShowFulfillPledge] = useState(false);

  // Find the goal from the goals list
  const goalData = goals.find(g => g.id === id);

  useEffect(() => {
    if (!user || !id) return;
    fetchContributions();
  }, [user, id]);

  const fetchContributions = async () => {
    try {
      // Fetch contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('contributions')
        .select('*')
        .eq('goal_id', id)
        .order('contribution_date', { ascending: true });

      if (contributionsError) throw contributionsError;

      setContributions(contributionsData || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast({
        title: "Error",
        description: "Failed to load contribution data.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 max-w-6xl mx-auto">
          <div className="animate-pulse" role="status" aria-label="Loading goal data">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center h-64 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goal not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The goal you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const targetDate = new Date(goalData.target_date);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const confirmedContributions = contributions.filter(c => c.is_confirmed);
  const totalContributions = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  const projectedInterest = goalData.current_total - (goalData.initial_amount || 0) - totalContributions;

  // Calculate contribution start date for display
  const contributionStartDate = getContributionStartDate(goalData.created_at);
  const contributionStarted = today >= contributionStartDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0" 
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-left truncate">
                  {goalData.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                  <Badge className={cn("border self-start", getStatusColor(goalData.onTrackStatus))}>
                    {getStatusText(goalData.onTrackStatus)}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(goalData.progressPercentage)}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/goals/${id}/edit`)} 
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto text-xs sm:text-sm"
              >
                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Edit Goal
              </Button>
              <Button 
                onClick={() => setShowFulfillPledge(true)} 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm"
              >
                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Fulfill Pledge
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        {/* Key Metrics Cards */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">Goal Metrics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-left">Amount Saved</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-left">
                      {formatCurrency(goalData.current_total)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-left truncate">
                      Target: {formatCurrency(goalData.target_amount)}
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-left">Monthly Pledge</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-left">
                      {formatCurrency(goalData.monthly_pledge)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-left">
                      {contributionStarted ? 'Active' : `Starts ${contributionStartDate.toLocaleDateString('en-US', { month: 'short' })}`}
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-left">Interest Earned</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 text-left">
                      {formatCurrency(Math.max(0, projectedInterest))}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-left">
                      At {goalData.expected_return_rate || 0}% annual
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-left">Days Remaining</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-left">
                      {daysRemaining}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-left">
                      Until {targetDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Financial Progress Chart */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white text-left text-base sm:text-lg lg:text-xl">
              Financial Progress Chart
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-left text-xs sm:text-sm lg:text-base">
              Track your financial journey with projected vs actual progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <EnhancedGoalProgressChart goal={goalData} contributions={contributions} />
          </CardContent>
        </Card>

        {/* Enhanced Contribution History */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white text-left text-base sm:text-lg lg:text-xl">
              Contribution Timeline
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-left text-xs sm:text-sm lg:text-base">
              Complete history of your savings journey, organized by year
              {goalData.initial_amount > 0 && (
                <span className="block text-blue-600 dark:text-blue-400 mt-1">
                  🏦 Includes your initial deposit of {formatCurrency(goalData.initial_amount)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ImprovedContributionHistory goal={goalData} contributions={contributions} />
          </CardContent>
        </Card>
      </main>

      {/* Fulfill Pledge Dialog */}
      <FulfillPledgeDialog
        open={showFulfillPledge}
        onOpenChange={setShowFulfillPledge}
        goalId={goalData.id}
        goalName={goalData.name}
        monthlyPledge={goalData.monthly_pledge}
        goalCreatedAt={goalData.created_at}
        contributions={contributions}
        onSuccess={fetchContributions}
      />
    </div>
  );
};

export default GoalDetail;
