export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          type: 'image' | 'pdf'
          content: string
          metadata: Record<string, any>
          is_shared: boolean
          storage_path: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Row']>
      }
      comments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          document_id: string
          content: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comments']['Row']>
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          role: 'admin' | 'user'
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
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
  }
}
