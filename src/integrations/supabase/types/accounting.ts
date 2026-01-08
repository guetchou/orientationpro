import { Json } from './json'

export interface AccountingTypes {
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
      }
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
      }
    ]
  }
}