export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
