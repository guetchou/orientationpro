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
      accounting_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          entries: Json
          id: string
          period_id: string | null
          reference: string | null
          status: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          entries: Json
          id?: string
          period_id?: string | null
          reference?: string | null
          status?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          entries?: Json
          id?: string
          period_id?: string | null
          reference?: string | null
          status?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_periods: {
        Row: {
          closed_at: string | null
          created_at: string | null
          end_date: string
          fiscal_year_id: string | null
          id: string
          start_date: string
          status: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          end_date: string
          fiscal_year_id?: string | null
          id?: string
          start_date: string
          status?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          end_date?: string
          fiscal_year_id?: string | null
          id?: string
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_periods_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          class: number
          code: string
          created_at: string | null
          label: string
          parent_code: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          class: number
          code: string
          created_at?: string | null
          label: string
          parent_code?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          class?: number
          code?: string
          created_at?: string | null
          label?: string
          parent_code?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_code_fkey"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["code"]
          },
        ]
      }
      asterisk_events: {
        Row: {
          agent_id: string | null
          created_at: string
          event_data: Json
          event_type: string
          id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asterisk_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "call_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      call_agents: {
        Row: {
          asterisk_extension: string | null
          created_at: string | null
          extension: string | null
          id: string
          last_call_time: string | null
          sip_pass: string | null
          sip_user: string | null
          status: string | null
          updated_at: string | null
          vicidial_id: string
        }
        Insert: {
          asterisk_extension?: string | null
          created_at?: string | null
          extension?: string | null
          id?: string
          last_call_time?: string | null
          sip_pass?: string | null
          sip_user?: string | null
          status?: string | null
          updated_at?: string | null
          vicidial_id: string
        }
        Update: {
          asterisk_extension?: string | null
          created_at?: string | null
          extension?: string | null
          id?: string
          last_call_time?: string | null
          sip_pass?: string | null
          sip_user?: string | null
          status?: string | null
          updated_at?: string | null
          vicidial_id?: string
        }
        Relationships: []
      }
      call_campaigns: {
        Row: {
          completed_calls: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          success_rate: number | null
          target_calls: number | null
          updated_at: string | null
        }
        Insert: {
          completed_calls?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          success_rate?: number | null
          target_calls?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_calls?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          success_rate?: number | null
          target_calls?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          agent_id: string | null
          campaign_id: string | null
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "call_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "call_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          closed_at: string | null
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          answers: Json
          created_at: string
          id: string
          results: Json
          test_type: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          results: Json
          test_type: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          results?: Json
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      vicidial_config: {
        Row: {
          api_pass: string
          api_user: string
          asterisk_port: number | null
          asterisk_server: string
          created_at: string
          id: string
          server_url: string
          updated_at: string
        }
        Insert: {
          api_pass: string
          api_user: string
          asterisk_port?: number | null
          asterisk_server: string
          created_at?: string
          id?: string
          server_url: string
          updated_at?: string
        }
        Update: {
          api_pass?: string
          api_user?: string
          asterisk_port?: number | null
          asterisk_server?: string
          created_at?: string
          id?: string
          server_url?: string
          updated_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
