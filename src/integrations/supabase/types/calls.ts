import { Json } from './json'

export interface CallTypes {
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
      }
    ]
  }
}