import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations, we'll use the same client but with custom JWT
export const createSupabaseServerClient = (accessToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    }
  })
}

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          clerk_org_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          clerk_org_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          clerk_org_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          clerk_user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          clerk_user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          clerk_user_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          name: string
          email: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          contact_person: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          contact_person?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          contact_person?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          quote_number: string
          title: string | null
          description: string | null
          status: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          valid_until: string | null
          notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          customer_id: string
          quote_number: string
          title?: string | null
          description?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          valid_until?: string | null
          notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          customer_id?: string
          quote_number?: string
          title?: string | null
          description?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          valid_until?: string | null
          notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_line_items: {
        Row: {
          id: string
          quote_id: string
          item_number: number
          description: string
          quantity: number
          unit_price: number
          line_total: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          item_number: number
          description: string
          quantity?: number
          unit_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          item_number?: number
          description?: string
          quantity?: number
          unit_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          tenant_id: string
          job_number: string
          customer_name: string | null
          part_number: string | null
          description: string | null
          quantity: number
          estimated_cost: number | null
          actual_cost: number
          status: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          job_number: string
          customer_name?: string | null
          part_number?: string | null
          description?: string | null
          quantity?: number
          estimated_cost?: number | null
          actual_cost?: number
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          job_number?: string
          customer_name?: string | null
          part_number?: string | null
          description?: string | null
          quantity?: number
          estimated_cost?: number | null
          actual_cost?: number
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}