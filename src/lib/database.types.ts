export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          role: "resident" | "security" | "estate_manager" | "estate_admin";
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          role?: "resident" | "security" | "estate_manager" | "estate_admin";
          is_active?: boolean;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      units: {
        Row: {
          id: string;
          unit_code: string;
          block_name: string | null;
          unit_type: string | null;
          occupancy_status: "occupied" | "vacant" | "maintenance";
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["units"]["Row"]> & { unit_code: string };
        Update: Partial<Database["public"]["Tables"]["units"]["Row"]>;
      };
      visitors: {
        Row: {
          id: string;
          resident_id: string;
          unit_id: string;
          visitor_name: string;
          visitor_phone: string | null;
          vehicle_registration: string | null;
          visitor_category: string;
          expected_at: string;
          expires_at: string;
          pass_code: string;
          status: string;
          checked_in_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["visitors"]["Row"]> & { visitor_name: string; resident_id: string; unit_id: string };
        Update: Partial<Database["public"]["Tables"]["visitors"]["Row"]>;
      };
      resident_units: {
        Row: { id: string; resident_id: string; unit_id: string; relationship?: string };
        Insert: { resident_id: string; unit_id: string; relationship?: string };
        Update: Partial<Database["public"]["Tables"]["resident_units"]["Row"]>;
      };
      announcements: {
        Row: { id: string; title: string; body: string; category: string; priority: string; published: boolean; created_at: string; created_by: string };
        Insert: { title: string; body: string; category?: string; priority?: string; published?: boolean; created_by: string };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
      };
      service_requests: {
        Row: { id: string; resident_id: string; unit_id: string; category: string; title: string; description: string; priority: string; status: string; created_at: string };
        Insert: { resident_id: string; unit_id: string; category: string; title: string; description: string; priority?: string };
        Update: Partial<Database["public"]["Tables"]["service_requests"]["Row"]>;
      };
      access_logs: {
        Row: { id: string; visitor_id: string; unit_id: string; resident_id: string; guard_id: string; event_type: string; gate_name: string; visitor_name_snapshot: string; occurred_at: string };
        Insert: { visitor_id: string; unit_id: string; resident_id: string; guard_id: string; event_type: string; gate_name: string; visitor_name_snapshot: string };
        Update: Partial<Database["public"]["Tables"]["access_logs"]["Row"]>;
      };
      emergency_alerts: {
        Row: { id: string; raised_by: string; unit_id: string; alert_type: string; description: string; status: string; created_at: string };
        Insert: { raised_by: string; unit_id: string; alert_type: string; description?: string; status?: string };
        Update: Partial<Database["public"]["Tables"]["emergency_alerts"]["Row"]>;
      };
    };
    Views: {};
    Functions: {
      current_role: { Args: {}; Returns: string };
      is_staff: { Args: {}; Returns: boolean };
      is_manager: { Args: {}; Returns: boolean };
      is_resident_of: { Args: { p_unit: string }; Returns: boolean };
    };
    Enums: {
      app_role: "resident" | "security" | "estate_manager" | "estate_admin";
      visitor_status:
        | "pending" | "approved" | "denied"
        | "checked_in" | "checked_out" | "expired" | "cancelled";
      request_status:
        | "submitted" | "acknowledged" | "in_progress"
        | "awaiting_resident" | "resolved" | "closed" | "rejected";
      request_priority: "low" | "normal" | "high" | "urgent";
    };
  };
}