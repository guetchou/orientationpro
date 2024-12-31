import { Json } from './json'

export interface OtherTypes {
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
      }
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
      }
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