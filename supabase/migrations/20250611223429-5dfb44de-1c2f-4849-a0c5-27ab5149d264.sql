
-- Create enum for goal status
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused');

-- Create enum for pledge status
CREATE TYPE pledge_status AS ENUM ('pending', 'fulfilled', 'partial');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  target_date DATE NOT NULL,
  initial_amount DECIMAL(12,2) DEFAULT 0,
  current_total DECIMAL(12,2) DEFAULT 0,
  monthly_pledge DECIMAL(12,2) NOT NULL,
  expected_return_rate DECIMAL(5,2) DEFAULT 5.0,
  status goal_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table for tracking actual contributions
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  contribution_date DATE NOT NULL,
  description TEXT,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pledges table for monthly pledge tracking
CREATE TABLE public.pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  pledged_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2),
  status pledge_status DEFAULT 'pending',
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Contributions policies
CREATE POLICY "Users can view own contributions" ON public.contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contributions" ON public.contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contributions" ON public.contributions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contributions" ON public.contributions
  FOR DELETE USING (auth.uid() = user_id);

-- Pledges policies
CREATE POLICY "Users can view own pledges" ON public.pledges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pledges" ON public.pledges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pledges" ON public.pledges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pledges" ON public.pledges
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update goal current_total when contributions change
CREATE OR REPLACE FUNCTION public.update_goal_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.goals 
  SET current_total = initial_amount + (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.contributions 
    WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id) 
    AND is_confirmed = true
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating goal totals
CREATE TRIGGER update_goal_total_on_contribution_insert
  AFTER INSERT ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_total();

CREATE TRIGGER update_goal_total_on_contribution_update
  AFTER UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_total();

CREATE TRIGGER update_goal_total_on_contribution_delete
  AFTER DELETE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_total();
