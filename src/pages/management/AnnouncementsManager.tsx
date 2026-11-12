import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AnnouncementsManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const list = useQuery({
    queryKey: ["announcements_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (v: any) => {
      const { error } = await (supabase.from("announcements") as any).insert([{
        title: v.title, body: v.body, category: v.category, priority: v.priority, published: true, created_by: user!.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements_all"] }); reset(); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements_all"] }),
  });

  return (
    <div>
      <h1 className="text-2xl mb-4">Announcements Manager</h1>
      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-3">
          <input {...register("title")} placeholder="Title" className="w-full border border-line rounded-lg p-3 bg-white" />
          <textarea {...register("body")} placeholder="Body" className="w-full border border-line rounded-lg p-3 bg-white" rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <input {...register("category")} placeholder="Category" className="border border-line rounded-lg p-3 bg-white" />
            <select {...register("priority")} className="border border-line rounded-lg p-3 bg-white">
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <button className="btn-primary">Publish</button>
        </form>
      </div>
      <div className="space-y-3">
        {(list.data ?? []).map((a: any) => (
          <div key={a.id} className="card p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">{a.title}</span>
              <span className="text-slate text-xs ml-2">{a.category}</span>
            </div>
            <button onClick={() => del.mutate(a.id)} className="btn-secondary text-signal text-xs">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}