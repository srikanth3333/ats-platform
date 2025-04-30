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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'admin' | 'recruiter' | 'hiring_manager'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'admin' | 'recruiter' | 'hiring_manager'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'recruiter' | 'hiring_manager'
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string
          status: 'draft' | 'published' | 'closed'
          department: string
          location: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          requirements: string
          status?: 'draft' | 'published' | 'closed'
          department: string
          location: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          requirements?: string
          status?: 'draft' | 'published' | 'closed'
          department?: string
          location?: string
          created_by?: string
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          resume_url: string
          source: string
          status: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'hired' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          resume_url: string
          source: string
          status?: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'hired' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          resume_url?: string
          source?: string
          status?: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'hired' | 'rejected'
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          status: 'new' | 'reviewed' | 'interview_scheduled' | 'rejected' | 'offered'
          applied_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          status?: 'new' | 'reviewed' | 'interview_scheduled' | 'rejected' | 'offered'
          applied_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          status?: 'new' | 'reviewed' | 'interview_scheduled' | 'rejected' | 'offered'
          applied_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          interviewer_id: string
          scheduled_at: string
          feedback: string | null
          rating: number | null
        }
        Insert: {
          id?: string
          application_id: string
          interviewer_id: string
          scheduled_at: string
          feedback?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          application_id?: string
          interviewer_id?: string
          scheduled_at?: string
          feedback?: string | null
          rating?: number | null
        }
      }
    }
  }
}