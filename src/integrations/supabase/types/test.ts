import { Json } from './json'

export interface TestTypes {
  test_results: {
    Row: {
      id: string
      user_id: string
      test_type: string
      results: Json
      answers: Json
      created_at: string
    }
    Insert: {
      id?: string
      user_id: string
      test_type: string
      results: Json
      answers: Json
      created_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      test_type?: string
      results?: Json
      answers?: Json
      created_at?: string
    }
    Relationships: []
  }
}