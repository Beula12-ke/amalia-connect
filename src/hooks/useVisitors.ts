import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useVisitors() {
  return useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitors")
        .select("*, units(unit_code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newVisitor: any) => {
      const pass_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await (supabase.from("visitors") as any)
        .insert([{ ...newVisitor, pass_code, status: "approved" }])
        .select()
        .single();
      if (error) throw error;

      // Optional: insert a notification row so real-time push alerts fire.
      // Wrapped in try/catch so a notification failure never breaks visitor creation.
      if (data?.id && newVisitor.resident_id) {
        try {
          await (supabase.from("notifications") as any).insert([{
            user_id: newVisitor.resident_id,
            title: "Visitor pass created",
            message: `Your visitor pass for ${newVisitor.visitor_name ?? "a visitor"} is ready (code: ${pass_code}).`,
            type: "visitor",
            reference_id: data.id,
          }]);
        } catch {
          // Notification insert failed — non-fatal.
        }
      }

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
}