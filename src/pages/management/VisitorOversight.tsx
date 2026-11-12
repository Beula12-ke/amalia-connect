import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Ban } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FILTERS = ["all", "approved", "pending", "checked_in"] as const;

export default function VisitorOversight() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const visitors = useQuery({
    queryKey: ["all_visitors_oversight"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitors")
        .select("*, units(unit_code), profiles:resident_id(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("visitors") as any).update({ status: "cancelled" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all_visitors_oversight"] }),
  });

  const rows = useMemo(() => (visitors.data ?? []).filter((v: any) => filter === "all" || v.status === filter), [visitors.data, filter]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Eye className="text-gold" />
        <h1 className="text-2xl">Visitor Oversight</h1>
      </div>
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn-primary text-xs" : "btn-secondary text-xs"}>{f.replace("_", " ")}</button>
        ))}
      </div>
      <div className="glass-card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-line">
              <th className="py-2">Visitor</th>
              <th className="py-2">Resident</th>
              <th className="py-2">Unit</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((v: any, i: number) => (
                <motion.tr key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-line hover:bg-ivory/50">
                  <td className="py-2">{v.visitor_name}</td>
                  <td className="py-2">{v.profiles?.full_name ?? "—"}</td>
                  <td className="py-2">{v.units?.unit_code ?? "—"}</td>
                  <td className="py-2"><span className={`${v.status === "approved" ? "badge-success" : "badge-neutral"} hover:scale-105 inline-block transition`}>{v.status}</span></td>
                  <td className="py-2">
                    {["approved", "pending", "checked_in"].includes(v.status) && (
                      <button onClick={() => revoke.mutate(v.id)} className="btn-secondary text-signal text-xs inline-flex items-center gap-1"><Ban size={14} />Revoke</button>
                    )}
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