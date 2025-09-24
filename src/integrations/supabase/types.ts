export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      counsellor_sessions: {
        Row: {
          counsellor_name: string
          created_at: string
          id: string
          next_appointment: string | null
          session_date: string
          session_notes: string | null
          session_rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          counsellor_name: string
          created_at?: string
          id?: string
          next_appointment?: string | null
          session_date: string
          session_notes?: string | null
          session_rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          counsellor_name?: string
          created_at?: string
          id?: string
          next_appointment?: string | null
          session_date?: string
          session_notes?: string | null
          session_rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crisis_resources: {
        Row: {
          available_hours: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          phone_number: string | null
          priority_order: number | null
          resource_type: string
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          available_hours?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          priority_order?: number | null
          resource_type: string
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          available_hours?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          priority_order?: number | null
          resource_type?: string
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_data: Json
          assessment_score: number | null
          chatbot_conversation: Json | null
          created_at: string
          id: string
          risk_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data: Json
          assessment_score?: number | null
          chatbot_conversation?: Json | null
          created_at?: string
          id?: string
          risk_level: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json
          assessment_score?: number | null
          chatbot_conversation?: Json | null
          created_at?: string
          id?: string
          risk_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_alerts: {
        Row: {
          alert_type: string
          delivery_status: string | null
          id: string
          message: string
          recipient_phone: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          alert_type: string
          delivery_status?: string | null
          id?: string
          message: string
          recipient_phone: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          alert_type?: string
          delivery_status?: string | null
          id?: string
          message?: string
          recipient_phone?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: []
      }
      wellness_activities: {
        Row: {
          activity_name: string
          activity_type: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          points_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_name: string
          activity_type: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_name?: string
          activity_type?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
