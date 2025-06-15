
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateGoalMetrics } from '@/services/goalCalculations';
import type { Goal, GoalWithCalculations } from '@/types/goal';

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
  
  const [goalData, setGoalData] = useState<Goal | null>(null);
  const [goalWithCalculations, setGoalWithCalculations] = useState<GoalWithCalculations | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFulfillPledge, setShowFulfillPledge] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    fetchGoalData();
  }, [user, id]);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      
      // Fetch goal data
      const { data: rawGoalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (goalError) throw goalError;
      if (!rawGoalData) {
        toast({
          title: "Goal not found",
          description: "The goal you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Fetch contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('contributions')
        .select('*')
        .eq('goal_id', id)
        .order('contribution_date', { ascending: true });

      if (contributionsError) throw contributionsError;

      // Calculate goal metrics using the same service as homepage
      const goalWithMetrics = calculateGoalMetrics(rawGoalData);

      setGoalData(rawGoalData);
      setGoalWithCalculations(goalWithMetrics);
      setContributions(contributionsData || []);
    } catch (error) {
      console.error('Error fetching goal data:', error);
      toast({
        title: "Error",
        description: "Failed to load goal data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use the shared status functions from GoalCard
  const getStatusColor = (status: GoalWithCalculations['onTrackStatus']) => {
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

  const getStatusText = (status: GoalWithCalculations['onTrackStatus']) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse" role="status" aria-label="Loading goal data">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

  if (!goalData || !goalWithCalculations) return null;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goalData.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge className={cn("border", getStatusColor(goalWithCalculations.onTrackStatus))}>
                    {getStatusText(goalWithCalculations.onTrackStatus)}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(goalWithCalculations.progressPercentage)}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/goals/${id}/edit`)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Goal
              </Button>
              <Button 
                onClick={() => setShowFulfillPledge(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white dark:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Fulfill Pledge
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics Cards */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">Goal Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount Saved</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goalData.current_total)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Target: {formatCurrency(goalData.target_amount)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Pledge</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goalData.monthly_pledge)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {contributionStarted ? 'Active' : `Starts ${contributionStartDate.toLocaleDateString('en-US', { month: 'short' })}`}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Interest Earned</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Math.max(0, projectedInterest))}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      At {goalData.expected_return_rate || 0}% annual
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {daysRemaining}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Until {targetDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Financial Progress Chart */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Financial Progress Chart</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Track your financial journey with projected vs actual progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedGoalProgressChart 
              goal={goalData} 
              contributions={contributions}
            />
          </CardContent>
        </Card>

        {/* Enhanced Contribution History */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Contribution Timeline</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Complete history of your savings journey, organized by year
              {goalData.initial_amount > 0 && (
                <span className="block text-blue-600 dark:text-blue-400 mt-1">
                  🏦 Includes your initial deposit of {formatCurrency(goalData.initial_amount)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImprovedContributionHistory 
              goal={goalData}
              contributions={contributions}
            />
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
        onSuccess={fetchGoalData}
      />
    </div>
  );
};

export default GoalDetail;
