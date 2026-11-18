import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ServiceRequests() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const [unitId, setUnitId] = useState<string | null>(null);

  async function findBestProvider(category: string) {
    // a. Prefer an available provider in the requested category.
    const { data: available } = await (supabase.from("provider_status") as any)
      .select("*")
      .eq("current_status", "available")
      .eq("category", category)
      .limit(1);
    if (available && available.length > 0) return available[0] as any;

    // b. Otherwise pick the busy provider who will finish soonest.
    const { data: busy } = await (supabase.from("provider_status") as any)
      .select("*")
      .eq("current_status", "busy")
      .eq("category", category)
      .order("task_started_at", { ascending: true });
    if (busy && busy.length > 0) {
      const now = Date.now();
      let best: any = null;
      let bestFinish = Infinity;
      for (const p of busy) {
        if (!p.task_started_at) continue;
        const finish = new Date(p.task_started_at).getTime() + (p.estimated_minutes ?? 30) * 60_000;
        if (finish < bestFinish) {
          bestFinish = finish;
          best = p;
        }
      }
      return best;
    }

    // c. No providers at all.
    return null;
  }

  const requests = useQuery({
    queryKey: ["service_requests", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("service_requests") as any)
        .select("*, units(unit_code), profiles:assigned_provider_id(full_name)")
        .eq("resident_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: async (values: any) => {
      let resolvedUnitId = unitId;
      if (!resolvedUnitId) {
        const { data } = await (supabase.from("resident_units") as any)
          .select("unit_id")
          .eq("resident_id", user!.id)
          .single();
        resolvedUnitId = data?.unit_id ?? null;
        setUnitId(resolvedUnitId);
      }

      const provider = await findBestProvider(values.category);

      let estimatedArrival: string | null = null;
      if (provider) {
        if (provider.current_status === "busy" && provider.task_started_at) {
          const finish = new Date(provider.task_started_at).getTime() + (provider.estimated_minutes ?? 30) * 60_000;
          const remaining = Math.max(5, Math.round((finish - Date.now()) / 60_000));
          estimatedArrival = `${remaining}-${remaining + 15} mins`;
        } else {
          estimatedArrival = "15-30 mins";
        }
      }

      const row: any = {
        resident_id: user!.id,
        unit_id: resolvedUnitId,
        category: values.category,
        title: values.title,
        description: values.description,
        priority: values.priority ?? "normal",
        status: provider ? "acknowledged" : "submitted",
      };
      if (provider) {
        row.assigned_provider_id = provider.provider_id;
        row.assigned_at = new Date().toISOString();
        row.estimated_arrival = estimatedArrival;
      }

      const { error } = await (supabase.from("service_requests") as any).insert([row]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_requests", user?.id] });
      reset();
    },
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h1 className="text-2xl mb-4">New Service Request</h1>
        <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="space-y-3">
          <select {...register("category")} className="w-full border border-line rounded-lg p-3 bg-white">
            <option value="maintenance">Maintenance</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
          <input {...register("title")} placeholder="Title" className="w-full border border-line rounded-lg p-3 bg-white" />
          <textarea {...register("description")} placeholder="Description" className="w-full border border-line rounded-lg p-3 bg-white" rows={4} />
          <button className="btn-primary" disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
      <div className="card p-6">
        <h2 className="text-xl mb-4">My Requests</h2>
        <div className="space-y-3">
          {(requests.data ?? []).map((r: any) => {
            const providerName = r.profiles?.full_name;
            return (
              <div key={r.id} className="border border-line rounded-lg p-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">{r.title}</span>
                  {providerName ? (
                    <span className="badge-success">Provider Assigned</span>
                  ) : (
                    <span className="badge-warning">Searching for Provider...</span>
                  )}
                </div>
                <p className="text-slate text-xs mt-1">{r.category}</p>
                {providerName && (
                  <p className="text-xs mt-1 text-slate">
                    <span className="font-semibold text-navy">{providerName}</span>
                    {r.estimated_arrival ? ` · ETA ${r.estimated_arrival}` : ""}
                  </p>
                )}
                {!providerName && r.estimated_arrival && (
                  <p className="text-xs mt-1 text-slate">ETA {r.estimated_arrival}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}