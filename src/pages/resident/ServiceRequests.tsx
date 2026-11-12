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

  const requests = useQuery({
    queryKey: ["service_requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("resident_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: async (values: any) => {
      let resolvedUnitId = unitId;
      if (!resolvedUnitId) {
        const { data } = await (supabase.from("resident_units") as any).select("unit_id").eq("resident_id", user!.id).single();
        resolvedUnitId = data?.unit_id ?? null;
        setUnitId(resolvedUnitId);
      }
      const { error } = await (supabase.from("service_requests") as any).insert([{
        resident_id: user!.id,
        unit_id: resolvedUnitId,
        category: values.category,
        title: values.title,
        description: values.description,
        priority: values.priority ?? "normal",
      }]);
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
          <button className="btn-primary">Submit</button>
        </form>
      </div>
      <div className="card p-6">
        <h2 className="text-xl mb-4">My Requests</h2>
        <div className="space-y-3">
          {(requests.data ?? []).map((r: any) => (
            <div key={r.id} className="border border-line rounded-lg p-3">
              <div className="flex justify-between">
                <span className="font-medium">{r.title}</span>
                <span className="badge-neutral">{r.status}</span>
              </div>
              <p className="text-slate text-xs mt-1">{r.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}