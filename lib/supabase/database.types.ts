export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string | null
          est_time: number
          actual_time: number
          task_date: string
          is_done: boolean
          created_at: string
          start_time: string | null
          end_time: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          category?: string | null
          est_time: number
          actual_time?: number
          task_date: string
          is_done?: boolean
          created_at?: string
          start_time?: string | null
          end_time?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string | null
          est_time?: number
          actual_time?: number
          task_date?: string
          is_done?: boolean
          created_at?: string
          start_time?: string | null
          end_time?: string | null
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          start_time: string
          end_time: string
          duration: number
          distractions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          task_id: string
          start_time: string
          end_time: string
          duration: number
          distractions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          start_time?: string
          end_time?: string
          duration?: number
          distractions?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_actual_time: {
        Args: {
          task_id_param: string
          duration_param: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
