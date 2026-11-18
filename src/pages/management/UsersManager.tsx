import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, Trash2, ShieldOff, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AppRole } from "@/types";

export default function UsersManager() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const isConfirmed = (u: any) => u.email_confirmed_at != null || confirmedIds.has(u.id);

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => {
      const { error } = await (supabase.from("profiles") as any).update({ role } as any).eq("id", id);
      if (error) throw error;
      if (role === "service_provider") {
        await (supabase.from("provider_status") as any).upsert(
          { provider_id: id, current_status: "offline" },
          { onConflict: "provider_id" }
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: any) => setError(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase.from("profiles") as any).update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => setError(e.message),
  });

  const confirmEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.rpc as any)("admin_confirm_user", { target_user_id: id });
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      setConfirmedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setError(null);
      setNotice("Email confirmed successfully.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (e: any) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: any) => setError(e.message),
  });

  if (isLoading) {
    return (
      <div className="glass-card p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <UserCog className="text-gold" />
        <h1 className="text-2xl">User Management</h1>
      </div>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="badge-success mb-4 inline-flex items-center gap-1"
        >
          <CheckCircle2 size={14} /> {notice}
        </motion.div>
      )}
      {error && <div className="badge-danger mb-4">{error}</div>}
      <div className="glass-card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-line">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {(users ?? []).map((u: any, i: number) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-line hover:bg-ivory/50">
                  <td className="py-2">{u.full_name}</td>
                  <td className="py-2">{u.email ?? "—"}</td>
                  <td className="py-2">
                    <select value={u.role} onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as AppRole })} className="border border-line rounded-lg p-1.5 bg-white">
                      <option value="resident">resident</option>
                      <option value="security">security</option>
                      <option value="service_provider">service_provider</option>
                      <option value="estate_manager">estate_manager</option>
                      <option value="estate_admin">estate_admin</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <span className={`${u.is_active ? "badge-success" : "badge-neutral"} hover:scale-105 inline-block transition`}>{u.is_active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isConfirmed(u) ? (
                        <span className="inline-flex items-center gap-1 text-estate text-xs font-semibold" title="Email confirmed">
                          <CheckCircle2 size={16} /> Confirmed
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmEmail.mutate(u.id)}
                          disabled={confirmEmail.isPending}
                          className="btn-secondary text-xs inline-flex items-center gap-1 text-estate"
                        >
                          <Mail size={14} />
                          {confirmEmail.isPending && confirmEmail.variables === u.id ? "Confirming…" : "Confirm Email"}
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive.mutate({ id: u.id, is_active: !u.is_active })}
                        disabled={toggleActive.isPending || currentUser?.id === u.id}
                        title={currentUser?.id === u.id ? "Cannot deactivate self" : ""}
                        className={`btn-secondary text-xs inline-flex items-center gap-1 ${u.is_active ? "text-signal" : "text-estate"}`}
                      >
                        <ShieldOff size={14} />
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => remove.mutate(u.id)} className="btn-secondary text-signal text-xs inline-flex items-center gap-1"><Trash2 size={14} />Delete</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}