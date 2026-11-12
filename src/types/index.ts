export type AppRole = "resident" | "security" | "estate_manager" | "estate_admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: AppRole;
  is_active: boolean;
  avatar_url: string | null;
}