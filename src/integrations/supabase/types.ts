export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          is_confirmed: boolean | null
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date: string
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          is_confirmed?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          is_confirmed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          current_total: number | null
          description: string | null
          expected_return_rate: number | null
          id: string
          initial_amount: number | null
          monthly_pledge: number
          name: string
          status: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_total?: number | null
          description?: string | null
          expected_return_rate?: number | null
          id?: string
          initial_amount?: number | null
          monthly_pledge: number
          name: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_total?: number | null
          description?: string | null
          expected_return_rate?: number | null
          id?: string
          initial_amount?: number | null
          monthly_pledge?: number
          name?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number
          target_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pledges: {
        Row: {
          actual_amount: number | null
          created_at: string | null
          fulfilled_at: string | null
          goal_id: string
          id: string
          pledged_amount: number
          scheduled_date: string
          status: Database["public"]["Enums"]["pledge_status"] | null
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          created_at?: string | null
          fulfilled_at?: string | null
          goal_id: string
          id?: string
          pledged_amount: number
          scheduled_date: string
          status?: Database["public"]["Enums"]["pledge_status"] | null
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          created_at?: string | null
          fulfilled_at?: string | null
          goal_id?: string
          id?: string
          pledged_amount?: number
          scheduled_date?: string
          status?: Database["public"]["Enums"]["pledge_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledges_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_goals_count: number | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          active_goals_count?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          active_goals_count?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_active_goals: {
        Args: { user_id_param: string }
        Returns: number
      }
    }
    Enums: {
      goal_status: "active" | "completed" | "paused"
      pledge_status: "pending" | "fulfilled" | "partial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      goal_status: ["active", "completed", "paused"],
      pledge_status: ["pending", "fulfilled", "partial"],
    },
  },
} as const
