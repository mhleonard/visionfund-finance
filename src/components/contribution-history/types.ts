
export interface Goal {
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

export interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface MonthlyData {
  month: string;
  monthDisplay: string;
  year: number;
  pledgedAmount: number;
  actualAmount: number;
  status: 'confirmed' | 'pending' | 'missed' | 'future' | 'initial';
  contributions: Contribution[];
  isInitialAmount?: boolean;
}

export interface YearGroup {
  year: number;
  months: MonthlyData[];
  totalPledged: number;
  totalActual: number;
}

export interface ContributionHistoryProps {
  goal: Goal;
  contributions: Contribution[];
}
