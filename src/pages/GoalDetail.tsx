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

import { GoalProgressChart } from '@/components/GoalProgressChart';
import { ImprovedContributionHistory } from '@/components/ImprovedContributionHistory';
import { FulfillPledgeDialog } from '@/components/FulfillPledgeDialog';
import { formatCurrency, getContributionStartDate } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [goal, setGoal] = useState<Goal | null>(null);
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
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (goalError) throw goalError;
      if (!goalData) {
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

      setGoal(goalData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg mb-6" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!goal) return null;

  const progressPercentage = Math.min(100, (goal.current_total / goal.target_amount) * 100);
  const targetDate = new Date(goal.target_date);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  const confirmedContributions = contributions.filter(c => c.is_confirmed);
  const totalContributions = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  const projectedInterest = goal.current_total - (goal.initial_amount || 0) - totalContributions;

  // Calculate contribution start date for display
  const contributionStartDate = getContributionStartDate(goal.created_at);
  const contributionStarted = today >= contributionStartDate;

  const getStatusColor = () => {
    if (progressPercentage >= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (progressPercentage >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (progressPercentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = () => {
    if (progressPercentage >= 100) return 'Goal Achieved';
    if (progressPercentage >= 75) return 'On Track';
    if (progressPercentage >= 50) return 'Making Progress';
    return 'Behind Schedule';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge className={cn("border", getStatusColor())}>
                    {getStatusText()}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(progressPercentage)}% complete
                  </span>
                  {!contributionStarted && (
                    <Badge variant="outline" className="text-xs">
                      Contributions start {contributionStartDate.toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/goals/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Goal
              </Button>
              <Button 
                onClick={() => setShowFulfillPledge(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Fulfill Pledge
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Saved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(goal.current_total)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Initial: {formatCurrency(goal.initial_amount || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Pledge</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(goal.monthly_pledge)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {contributionStarted ? 'Active' : `Starts ${contributionStartDate.toLocaleDateString('en-US', { month: 'short' })}`}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interest Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(Math.max(0, projectedInterest))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    At {goal.expected_return_rate || 0}% annual
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
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
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Progress Chart */}
        <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Progress Chart</CardTitle>
            <CardDescription>
              Track your journey to your financial goal
              {!contributionStarted && (
                <span className="block text-amber-600 dark:text-amber-400 mt-1">
                  📅 Monthly contributions will begin on {contributionStartDate.toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalProgressChart 
              goal={goal} 
              contributions={contributions}
            />
          </CardContent>
        </Card>

        {/* Enhanced Contribution History */}
        <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Contribution Timeline</CardTitle>
            <CardDescription>
              Complete history of your savings journey, organized by year
              {goal.initial_amount > 0 && (
                <span className="block text-blue-600 dark:text-blue-400 mt-1">
                  🏦 Includes your initial deposit of {formatCurrency(goal.initial_amount)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImprovedContributionHistory 
              goal={goal}
              contributions={contributions}
            />
          </CardContent>
        </Card>
      </main>

      {/* Fulfill Pledge Dialog */}
      <FulfillPledgeDialog
        open={showFulfillPledge}
        onOpenChange={setShowFulfillPledge}
        goalId={goal.id}
        goalName={goal.name}
        monthlyPledge={goal.monthly_pledge}
        goalCreatedAt={goal.created_at}
        contributions={contributions}
        onSuccess={fetchGoalData}
      />
    </div>
  );
};

export default GoalDetail;
