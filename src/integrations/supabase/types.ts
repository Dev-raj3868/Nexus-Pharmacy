export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bill_items: {
        Row: {
          batch_no: string | null
          bill_id: string
          created_at: string
          gst_percent: number | null
          id: string
          item_name: string
          quantity: number
          total_price: number
          unit: string
          unit_price: number
          user_id: string
        }
        Insert: {
          batch_no?: string | null
          bill_id: string
          created_at?: string
          gst_percent?: number | null
          id?: string
          item_name: string
          quantity?: number
          total_price?: number
          unit: string
          unit_price?: number
          user_id: string
        }
        Update: {
          batch_no?: string | null
          bill_id?: string
          created_at?: string
          gst_percent?: number | null
          id?: string
          item_name?: string
          quantity?: number
          total_price?: number
          unit?: string
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_templates: {
        Row: {
          created_at: string
          declaration_enabled: boolean
          drug_license_enabled: boolean
          gst_enabled: boolean
          id: string
          item_enabled: boolean
          patient_enabled: boolean
          payment_enabled: boolean
          pharmacy_enabled: boolean
          template_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          declaration_enabled?: boolean
          drug_license_enabled?: boolean
          gst_enabled?: boolean
          id?: string
          item_enabled?: boolean
          patient_enabled?: boolean
          payment_enabled?: boolean
          pharmacy_enabled?: boolean
          template_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          declaration_enabled?: boolean
          drug_license_enabled?: boolean
          gst_enabled?: boolean
          id?: string
          item_enabled?: boolean
          patient_enabled?: boolean
          payment_enabled?: boolean
          pharmacy_enabled?: boolean
          template_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          bill_date: string
          bill_number: string
          created_at: string
          discount: number
          doctor_name: string | null
          gst_amount: number
          id: string
          patient_address: string | null
          patient_name: string
          patient_phone: string | null
          payment_method: string | null
          payment_status: string
          subtotal: number
          template_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_date?: string
          bill_number: string
          created_at?: string
          discount?: number
          doctor_name?: string | null
          gst_amount?: number
          id?: string
          patient_address?: string | null
          patient_name: string
          patient_phone?: string | null
          payment_method?: string | null
          payment_status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_date?: string
          bill_number?: string
          created_at?: string
          discount?: number
          doctor_name?: string | null
          gst_amount?: number
          id?: string
          patient_address?: string | null
          patient_name?: string
          patient_phone?: string | null
          payment_method?: string | null
          payment_status?: string
          subtotal?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bill_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      debit_credit_items: {
        Row: {
          batch_no: string | null
          category: string | null
          created_at: string
          debit_credit_note_id: string
          gst: string | null
          id: string
          item_name: string
          price: number | null
          quantity: number
          reason: string | null
          unit: string
          user_id: string
        }
        Insert: {
          batch_no?: string | null
          category?: string | null
          created_at?: string
          debit_credit_note_id: string
          gst?: string | null
          id?: string
          item_name: string
          price?: number | null
          quantity?: number
          reason?: string | null
          unit: string
          user_id: string
        }
        Update: {
          batch_no?: string | null
          category?: string | null
          created_at?: string
          debit_credit_note_id?: string
          gst?: string | null
          id?: string
          item_name?: string
          price?: number | null
          quantity?: number
          reason?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debit_credit_items_debit_credit_note_id_fkey"
            columns: ["debit_credit_note_id"]
            isOneToOne: false
            referencedRelation: "debit_credit_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      debit_credit_notes: {
        Row: {
          created_at: string
          id: string
          issue_date: string
          note_id: string
          note_type: string
          purchase_order_id: string | null
          reason: string | null
          received_id: string | null
          total: number | null
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue_date?: string
          note_id: string
          note_type: string
          purchase_order_id?: string | null
          reason?: string | null
          received_id?: string | null
          total?: number | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue_date?: string
          note_id?: string
          note_type?: string
          purchase_order_id?: string | null
          reason?: string | null
          received_id?: string | null
          total?: number | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      distributors: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          phone_number: string
          remark: string | null
          supplier_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          phone_number: string
          remark?: string | null
          supplier_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          phone_number?: string
          remark?: string | null
          supplier_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_no: string
          category: string
          created_at: string
          gst: string | null
          id: string
          item_id: string
          item_name: string
          min_stock: number
          price: number | null
          product_type: string | null
          rack: string | null
          stock: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_no: string
          category: string
          created_at?: string
          gst?: string | null
          id?: string
          item_id: string
          item_name: string
          min_stock?: number
          price?: number | null
          product_type?: string | null
          rack?: string | null
          stock?: number
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_no?: string
          category?: string
          created_at?: string
          gst?: string | null
          id?: string
          item_id?: string
          item_name?: string
          min_stock?: number
          price?: number | null
          product_type?: string | null
          rack?: string | null
          stock?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      issue_order_items: {
        Row: {
          created_at: string
          id: string
          issue_order_id: string
          item_id: string
          item_name: string
          quantity: number
          remark: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_order_id: string
          item_id: string
          item_name: string
          quantity?: number
          remark?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_order_id?: string
          item_id?: string
          item_name?: string
          quantity?: number
          remark?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_order_items_issue_order_id_fkey"
            columns: ["issue_order_id"]
            isOneToOne: false
            referencedRelation: "issue_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_orders: {
        Row: {
          created_at: string
          employee_name: string
          employee_type: string
          id: string
          issue_date: string
          remark: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_name: string
          employee_type: string
          id?: string
          issue_date?: string
          remark?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_name?: string
          employee_type?: string
          id?: string
          issue_date?: string
          remark?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          clinic_gst_number: string | null
          clinic_landline: string | null
          clinic_location: string | null
          clinic_name: string | null
          clinic_phone: string | null
          created_at: string
          date_of_birth: string | null
          dl_no: string | null
          first_name: string
          fssai_id: string | null
          gender: string | null
          id: string
          last_name: string
          pharmacy_address: string | null
          pharmacy_gst_number: string | null
          pharmacy_landline: string | null
          pharmacy_name: string | null
          pharmacy_phone: string | null
          pharmacy_pincode: string | null
          phone: string
          shifts: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          clinic_gst_number?: string | null
          clinic_landline?: string | null
          clinic_location?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          dl_no?: string | null
          first_name: string
          fssai_id?: string | null
          gender?: string | null
          id?: string
          last_name: string
          pharmacy_address?: string | null
          pharmacy_gst_number?: string | null
          pharmacy_landline?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          pharmacy_pincode?: string | null
          phone: string
          shifts?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          clinic_gst_number?: string | null
          clinic_landline?: string | null
          clinic_location?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          dl_no?: string | null
          first_name?: string
          fssai_id?: string | null
          gender?: string | null
          id?: string
          last_name?: string
          pharmacy_address?: string | null
          pharmacy_gst_number?: string | null
          pharmacy_landline?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          pharmacy_pincode?: string | null
          phone?: string
          shifts?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          item_name: string
          purchase_order_id: string
          quantity: number
          remark: string | null
          total_price: number | null
          unit: string
          unit_price: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          item_name: string
          purchase_order_id: string
          quantity?: number
          remark?: string | null
          total_price?: number | null
          unit: string
          unit_price?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          item_name?: string
          purchase_order_id?: string
          quantity?: number
          remark?: string | null
          total_price?: number | null
          unit?: string
          unit_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          payment_status: string
          purchase_order_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          payment_status?: string
          purchase_order_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          payment_status?: string
          purchase_order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_payments_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_date: string
          id: string
          requisition_date: string
          status: string
          supplier_id: string
          supplier_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_date: string
          id?: string
          requisition_date: string
          status?: string
          supplier_id: string
          supplier_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_date?: string
          id?: string
          requisition_date?: string
          status?: string
          supplier_id?: string
          supplier_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receive_order_items: {
        Row: {
          batch_no: string
          category: string | null
          created_at: string
          gst: string | null
          id: string
          item_id: string
          item_name: string
          price_per_quantity: number | null
          receive_order_id: string
          received_quantity: number
          remark: string | null
          unit: string
          user_id: string
        }
        Insert: {
          batch_no: string
          category?: string | null
          created_at?: string
          gst?: string | null
          id?: string
          item_id: string
          item_name: string
          price_per_quantity?: number | null
          receive_order_id: string
          received_quantity?: number
          remark?: string | null
          unit: string
          user_id: string
        }
        Update: {
          batch_no?: string
          category?: string | null
          created_at?: string
          gst?: string | null
          id?: string
          item_id?: string
          item_name?: string
          price_per_quantity?: number | null
          receive_order_id?: string
          received_quantity?: number
          remark?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receive_order_items_receive_order_id_fkey"
            columns: ["receive_order_id"]
            isOneToOne: false
            referencedRelation: "receive_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      receive_orders: {
        Row: {
          created_at: string
          delivery_status: string
          id: string
          payment_status: string
          purchase_id: string
          updated_at: string
          user_id: string
          vendor_name: string
        }
        Insert: {
          created_at?: string
          delivery_status?: string
          id?: string
          payment_status?: string
          purchase_id: string
          updated_at?: string
          user_id: string
          vendor_name: string
        }
        Update: {
          created_at?: string
          delivery_status?: string
          id?: string
          payment_status?: string
          purchase_id?: string
          updated_at?: string
          user_id?: string
          vendor_name?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const