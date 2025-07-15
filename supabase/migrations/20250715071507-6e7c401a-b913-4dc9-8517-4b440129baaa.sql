-- Add subscription fields to profiles table
ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'basic';
ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN active_goals_count INTEGER DEFAULT 0;

-- Create function to count active goals for a user
CREATE OR REPLACE FUNCTION public.count_active_goals(user_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.goals
  WHERE user_id = user_id_param AND status = 'active'
$$;

-- Create function to update active goals count
CREATE OR REPLACE FUNCTION public.update_active_goals_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the count for the affected user
  UPDATE public.profiles 
  SET active_goals_count = public.count_active_goals(COALESCE(NEW.user_id, OLD.user_id))
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update active goals count
CREATE TRIGGER update_goals_count_on_insert
  AFTER INSERT ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_active_goals_count();

CREATE TRIGGER update_goals_count_on_update
  AFTER UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_active_goals_count();

CREATE TRIGGER update_goals_count_on_delete
  AFTER DELETE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_active_goals_count();

-- Update existing users' active goals count
UPDATE public.profiles 
SET active_goals_count = public.count_active_goals(id);