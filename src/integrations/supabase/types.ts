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
      administrative_documents: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_type: string
          file_path: string | null
          id: string
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at: string | null
          updated_by: string | null
          version: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type: string
          file_path?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: string
          file_path?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          acquisition_cost: number
          acquisition_date: string
          category: string | null
          created_at: string | null
          current_value: number | null
          depreciation_rate: number | null
          description: string | null
          id: string
          last_evaluation_date: string | null
          location: string | null
          name: string
          responsible_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_cost: number
          acquisition_date: string
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          last_evaluation_date?: string | null
          location?: string | null
          name: string
          responsible_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_cost?: number
          acquisition_date?: string
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          last_evaluation_date?: string | null
          location?: string | null
          name?: string
          responsible_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          actual_amount: number | null
          category: string
          created_at: string | null
          id: string
          month: number
          planned_amount: number
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          actual_amount?: number | null
          category: string
          created_at?: string | null
          id?: string
          month: number
          planned_amount: number
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          actual_amount?: number | null
          category?: string
          created_at?: string | null
          id?: string
          month?: number
          planned_amount?: number
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: []
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
          completed_calls: number
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          success_rate: number | null
          target_calls: number
          updated_at: string | null
        }
        Insert: {
          completed_calls?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          success_rate?: number | null
          target_calls?: number
          updated_at?: string | null
        }
        Update: {
          completed_calls?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          success_rate?: number | null
          target_calls?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          amount: number | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          party_name: string
          renewal_reminder_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          party_name: string
          renewal_reminder_date?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          party_name?: string
          renewal_reminder_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          payment_status: string | null
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          payment_status?: string | null
          transaction_date?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          payment_status?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          actual_return_rate: number | null
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          expected_return_rate: number | null
          id: string
          investment_date: string
          responsible_id: string | null
          risk_level: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_return_rate?: number | null
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expected_return_rate?: number | null
          id?: string
          investment_date: string
          responsible_id?: string | null
          risk_level?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_return_rate?: number | null
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expected_return_rate?: number | null
          id?: string
          investment_date?: string
          responsible_id?: string | null
          risk_level?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_name: string
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      licenses_subscriptions: {
        Row: {
          cost: number | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          license_key: string | null
          name: string
          notes: string | null
          provider: string
          renewal_type: string | null
          start_date: string
          status: string | null
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          license_key?: string | null
          name: string
          notes?: string | null
          provider: string
          renewal_type?: string | null
          start_date: string
          status?: string | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          license_key?: string | null
          name?: string
          notes?: string | null
          provider?: string
          renewal_type?: string | null
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      margin_analysis: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          direct_costs: number
          gross_margin: number | null
          id: string
          indirect_costs: number | null
          net_margin: number | null
          notes: string | null
          period_end: string
          period_start: string
          product_service_name: string
          revenue: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          direct_costs: number
          gross_margin?: number | null
          id?: string
          indirect_costs?: number | null
          net_margin?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          product_service_name: string
          revenue: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          direct_costs?: number
          gross_margin?: number | null
          id?: string
          indirect_costs?: number | null
          net_margin?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          product_service_name?: string
          revenue?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          city: string
          coordinates: unknown | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["establishment_type"] | null
          updated_at: string | null
        }
        Insert: {
          city: string
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["establishment_type"] | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["establishment_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      performance_evaluations: {
        Row: {
          achievements: string[] | null
          areas_for_improvement: string[] | null
          comments: string | null
          created_at: string | null
          employee_id: string | null
          evaluation_date: string
          evaluator_id: string | null
          id: string
          next_review_date: string | null
          objectives: string[] | null
          rating: number | null
          status: Database["public"]["Enums"]["evaluation_status"] | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          areas_for_improvement?: string[] | null
          comments?: string | null
          created_at?: string | null
          employee_id?: string | null
          evaluation_date: string
          evaluator_id?: string | null
          id?: string
          next_review_date?: string | null
          objectives?: string[] | null
          rating?: number | null
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          areas_for_improvement?: string[] | null
          comments?: string | null
          created_at?: string | null
          employee_id?: string | null
          evaluation_date?: string
          evaluator_id?: string | null
          id?: string
          next_review_date?: string | null
          objectives?: string[] | null
          rating?: number | null
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          phone_number: string | null
          position: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          phone_number?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provisions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_use_date: string | null
          id: string
          provision_date: string
          risk_level: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_use_date?: string | null
          id?: string
          provision_date: string
          risk_level?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_use_date?: string | null
          id?: string
          provision_date?: string
          risk_level?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      skills_matrix: {
        Row: {
          acquired_date: string | null
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["skill_level"]
          notes: string | null
          skill_name: string
          updated_at: string | null
          user_id: string | null
          verified_by: string | null
        }
        Insert: {
          acquired_date?: string | null
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["skill_level"]
          notes?: string | null
          skill_name: string
          updated_at?: string | null
          user_id?: string | null
          verified_by?: string | null
        }
        Update: {
          acquired_date?: string | null
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["skill_level"]
          notes?: string | null
          skill_name?: string
          updated_at?: string | null
          user_id?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      strategic_objectives: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          kpi_target: string | null
          responsible_id: string | null
          start_date: string
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          kpi_target?: string | null
          responsible_id?: string | null
          start_date: string
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          kpi_target?: string | null
          responsible_id?: string | null
          start_date?: string
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string | null
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string | null
          id: string
          results: Json
          test_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          results: Json
          test_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          results?: Json
          test_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_enrollments: {
        Row: {
          completion_date: string | null
          created_at: string | null
          enrollment_date: string | null
          feedback: string | null
          id: string
          program_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          feedback?: string | null
          id?: string
          program_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          feedback?: string | null
          id?: string
          program_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          start_date: string | null
          status: string | null
          title: string
          trainer: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          trainer?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          trainer?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          mfa_enabled: boolean | null
          mfa_secret: string | null
          notification_preferences: Json | null
          theme: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vicidial_config: {
        Row: {
          api_pass: string
          api_user: string
          asterisk_port: number
          asterisk_server: string
          id: string
          server_url: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_pass: string
          api_user: string
          asterisk_port: number
          asterisk_server: string
          id?: string
          server_url: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_pass?: string
          api_user?: string
          asterisk_port?: number
          asterisk_server?: string
          id?: string
          server_url?: string
          updated_at?: string | null
          user_id?: string | null
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
      contract_type: "employment" | "service" | "lease" | "software" | "other"
      document_status: "draft" | "active" | "archived" | "expired"
      establishment_type: "university" | "school" | "institute"
      evaluation_status: "draft" | "in_progress" | "completed"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
      user_role: "admin" | "agent" | "comptable" | "rh" | "user"
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
