import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Play, CheckCircle2, MapPin, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const STATUS_ORDER = ["available", "busy", "offline"];

const STATUS_META: Record<string, { label: string; title: string; bg: string }> = {
  available: { label: "I am Available", title: "Available", bg: "bg-estate" },
  busy: { label: "I am Busy", title: "Busy", bg: "bg-amber" },
  offline: { label: "Offline", title: "Offline", bg: "bg-slate" },
};

export default function ProviderDashboard() {
  const qc = useQueryClient();
  const { user, profile } = useAuth();

  const status = useQuery({
    queryKey: ["provider-status", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.from("provider_status") as any)
        .select("*")
        .eq("provider_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const tasks = useQuery({
    queryKey: ["provider-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("service_requests") as any)
        .select("*, units(unit_code), profiles:resident_id(full_name)")
        .eq("assigned_provider_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const setStatus = useMutation({
    mutationFn: async (current_status: string) => {
      const { error } = await (supabase.from("provider_status") as any)
        .upsert({ provider_id: user!.id, current_status }, { onConflict: "provider_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provider-status", user?.id] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({
      id,
      next,
      providerStatus,
    }: {
      id: string;
      next: string;
      providerStatus: "busy" | "available";
    }) => {
      const { error } = await (supabase.from("service_requests") as any)
        .update({ status: next })
        .eq("id", id);
      if (error) throw error;
      const patch: any = {
        provider_id: user!.id,
        current_status: providerStatus,
        task_started_at: providerStatus === "busy" ? new Date().toISOString() : null,
      };
      const { error: e2 } = await (supabase.from("provider_status") as any)
        .upsert(patch, { onConflict: "provider_id" });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-tasks", user?.id] });
      qc.invalidateQueries({ queryKey: ["provider-status", user?.id] });
      qc.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  const current = status.data?.current_status ?? "offline";
  const meta = STATUS_META[current] ?? STATUS_META.offline;
  const providerName = profile?.full_name ?? "Provider";
  const category = status.data?.category ?? "General Services";
  const list = tasks.data ?? [];

  function cycleStatus() {
    const idx = STATUS_ORDER.indexOf(current);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setStatus.mutate(next);
  }

  return (
    <div className="min-h-screen bg-ivory p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-slate text-xs font-semibold uppercase tracking-widest">
            <Wrench className="text-gold" size={16} />
            {category}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
            Welcome, {providerName}
          </h1>
        </header>

        {/* MASTER TOGGLE */}
        <motion.button
          type="button"
          onClick={cycleStatus}
          disabled={setStatus.isPending}
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-3xl p-8 text-center text-white shadow-2xl transition-colors ${meta.bg}`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              {setStatus.isPending ? "Updating…" : meta.label}
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold">{meta.title}</span>
            <span className="text-sm text-white/70">Tap to change availability</span>
          </div>
        </motion.button>

        {/* TASK QUEUE */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
            <ClipboardList className="text-gold" size={18} />
            Task Queue
            <span className="badge-neutral">{list.length}</span>
          </h2>

          {tasks.isLoading ? (
            <div className="card p-8 text-center text-slate">Loading tasks…</div>
          ) : list.length === 0 ? (
            <div className="card p-8 text-center text-slate">No assigned tasks right now.</div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {list.map((t: any) => {
                  const canStart = t.status === "assigned" || t.status === "acknowledged";
                  const canComplete = t.status === "in_progress";
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="card p-4 flex items-start gap-3"
                    >
                      <div className="h-10 w-10 rounded-xl bg-navy text-gold grid place-items-center shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-navy truncate">{t.title}</h3>
                          <span className={canComplete ? "badge-warning" : "badge-neutral"}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate mt-0.5">
                          Resident Unit {t.units?.unit_code ?? "—"}
                        </p>
                        {t.description && (
                          <p className="text-xs text-slate mt-1 line-clamp-2">{t.description}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          {canStart && (
                            <button
                              onClick={() =>
                                updateTask.mutate({ id: t.id, next: "in_progress", providerStatus: "busy" })
                              }
                              disabled={updateTask.isPending}
                              className="btn-primary text-xs inline-flex items-center gap-1"
                            >
                              <Play size={14} /> Start Work
                            </button>
                          )}
                          {canComplete && (
                            <button
                              onClick={() =>
                                updateTask.mutate({ id: t.id, next: "resolved", providerStatus: "available" })
                              }
                              disabled={updateTask.isPending}
                              className="btn-primary text-xs inline-flex items-center gap-1"
                            >
                              <CheckCircle2 size={14} /> Complete Work
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}