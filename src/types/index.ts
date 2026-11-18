export type AppRole = "resident" | "security" | "service_provider" | "estate_manager" | "estate_admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: AppRole;
  is_active: boolean;
  avatar_url: string | null;
  notification_email: boolean;
  notification_sms: boolean;
  sound_alerts: boolean;
  hide_phone_from_guard: boolean;
  dark_mode: boolean;
  default_visitor_pass_hours: number | null;
  auto_approve_visitors: boolean;
  service_category: string | null;
}