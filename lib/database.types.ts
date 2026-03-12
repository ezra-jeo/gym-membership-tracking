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
      gyms: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          contact_number: string | null
          role: "member" | "admin" | "staff" | "owner"
          status: "pending" | "active" | "rejected"
          gym_id: string | null
          avatar_url: string | null
          qr_code: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          contact_number?: string | null
          role?: "member" | "admin" | "staff" | "owner"
          status?: "pending" | "active" | "rejected"
          gym_id?: string | null
          avatar_url?: string | null
          qr_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          contact_number?: string | null
          role?: "member" | "admin" | "staff" | "owner"
          status?: "pending" | "active" | "rejected"
          gym_id?: string | null
          avatar_url?: string | null
          qr_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      memberships: {
        Row: {
          id: string
          member_id: string
          plan_id: string
          start_date: string
          end_date: string
          status: "active" | "expired" | "frozen"
          payment_method: "cash" | "gcash"
          amount_paid: number
          gym_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          plan_id: string
          start_date: string
          end_date: string
          status?: "active" | "expired" | "frozen"
          payment_method: "cash" | "gcash"
          amount_paid: number
          gym_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          plan_id?: string
          start_date?: string
          end_date?: string
          status?: "active" | "expired" | "frozen"
          payment_method?: "cash" | "gcash"
          amount_paid?: number
          gym_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          price: number
          duration_days: number
          gym_id: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          duration_days: number
          gym_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          duration_days?: number
          gym_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      attendance: {
        Row: {
          id: string
          member_id: string
          check_in: string
          check_out: string | null
          duration_min: number | null
          gym_id: string | null
        }
        Insert: {
          id?: string
          member_id: string
          check_in?: string
          check_out?: string | null
          gym_id?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          check_in?: string
          check_out?: string | null
          gym_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      streaks: {
        Row: {
          id: string
          member_id: string
          current_streak: number
          best_streak: number
          last_visit_date: string | null
          gym_id: string | null
        }
        Insert: {
          id?: string
          member_id: string
          current_streak?: number
          best_streak?: number
          last_visit_date?: string | null
          gym_id?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          current_streak?: number
          best_streak?: number
          last_visit_date?: string | null
          gym_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          criteria: Json
          gym_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          criteria: Json
          gym_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          criteria?: Json
          gym_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      member_badges: {
        Row: {
          member_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          member_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          member_id?: string
          badge_id?: string
          earned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          goal_type: string
          goal_target: number
          start_date: string
          end_date: string
          reward: string | null
          created_by: string
          gym_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          goal_type: string
          goal_target: number
          start_date: string
          end_date: string
          reward?: string | null
          created_by: string
          gym_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          goal_type?: string
          goal_target?: number
          start_date?: string
          end_date?: string
          reward?: string | null
          created_by?: string
          gym_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          member_id: string
          progress: number
          completed: boolean
          joined_at: string
        }
        Insert: {
          challenge_id: string
          member_id: string
          progress?: number
          completed?: boolean
          joined_at?: string
        }
        Update: {
          challenge_id?: string
          member_id?: string
          progress?: number
          completed?: boolean
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      feed_items: {
        Row: {
          id: string
          member_id: string
          type: "check_in" | "check_out" | "badge" | "challenge" | "announcement" | "streak_milestone"
          title: string
          description: string | null
          metadata: Json | null
          kudos_count: number
          gym_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          type: "check_in" | "check_out" | "badge" | "challenge" | "announcement" | "streak_milestone"
          title: string
          description?: string | null
          metadata?: Json | null
          kudos_count?: number
          gym_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          type?: "check_in" | "check_out" | "badge" | "challenge" | "announcement" | "streak_milestone"
          title?: string
          description?: string | null
          metadata?: Json | null
          kudos_count?: number
          gym_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_items_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      kudos: {
        Row: {
          id: string
          from_member: string
          feed_item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          from_member: string
          feed_item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          from_member?: string
          feed_item_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_from_member_fkey"
            columns: ["from_member"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_feed_item_id_fkey"
            columns: ["feed_item_id"]
            isOneToOne: false
            referencedRelation: "feed_items"
            referencedColumns: ["id"]
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          created_by: string
          gym_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          created_by: string
          gym_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          created_by?: string
          gym_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_gym_and_owner: {
        Args: {
          p_user_id: string
          p_email: string
          p_name: string
          p_gym_name: string
          p_gym_code: string
          p_gym_address?: string | null
          p_gym_phone?: string | null
        }
        Returns: {
          gym_id: string
          gym_code: string
        }
      }
      // ── Kiosk RPCs (callable by anon key, no auth session required) ──
      kiosk_checkin: {
        Args: { p_qr_code: string }
        Returns:
          | { error: "unknown_qr" | "rejected"; message: string; member_name?: string }
          | { action: "checked_in"; attendance_id: string; member_id: string; member_name: string; member_status: string; duration_min: null }
          | { action: "checked_out"; attendance_id: string; member_id: string; member_name: string; duration_min: number }
      }
      kiosk_checkin_by_member: {
        Args: { p_member_id: string }
        Returns:
          | { error: "not_found"; message: string }
          | { action: "checked_in"; attendance_id: string; member_id: string; member_name: string; member_status: string; duration_min: null }
          | { action: "checked_out"; attendance_id: string; member_id: string; member_name: string; duration_min: number }
      }
      kiosk_checkout: {
        Args: { p_attendance_id: string }
        Returns: { error: "not_found" } | { duration_min: number }
      }
      kiosk_get_checked_in: {
        Args: Record<string, never>
        Returns: {
          attendance_id: string
          member_id: string
          member_name: string
          check_in: string
        }[]
      }
      kiosk_search_members: {
        Args: { p_query: string }
        Returns: {
          id: string
          name: string
          email: string
          contact_number: string | null
          membership_status: string | null
          plan_name: string | null
          end_date: string | null
        }[]
      }
      kiosk_update_streak: {
        Args: { p_member_id: string; p_gym_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "member" | "admin" | "staff" | "owner"
      profile_status: "pending" | "active" | "rejected"
      membership_status: "active" | "expired" | "frozen"
      payment_method: "cash" | "gcash"
      feed_item_type: "check_in" | "check_out" | "badge" | "challenge" | "announcement" | "streak_milestone"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}