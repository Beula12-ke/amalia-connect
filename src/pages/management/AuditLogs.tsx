import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { FileClock, Activity } from "lucide-react";
import type { Database } from "@/lib/database.types";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"] & {
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "role"> | null;
};

export default function AuditLogs() {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*, profiles(full_name, role)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">System Audit Logs</h1>
          <p className="text-slate mt-1">A secure, immutable history of all administrative actions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-line overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate flex flex-col items-center">
            <Activity className="animate-spin mb-4 text-gold" size={32} />
            Loading audit trail...
          </div>
        ) : logs?.length === 0 ? (
          <div className="p-10 text-center text-slate">
            No audit logs recorded yet. Actions like role changes or user deletions will appear here.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-ivory border-b border-line">
              <tr>
                <th className="p-4 text-xs font-bold text-slate uppercase">Timestamp</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Actor</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Action</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={log.id} 
                  className="border-b border-line last:border-0 hover:bg-ivory/50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-navy text-sm">{log.profiles?.full_name || "System"}</div>
                    <div className="text-xs text-slate uppercase tracking-wider">{log.profiles?.role || "—"}</div>
                  </td>
                  <td className="p-4">
                    <span className="badge badge-neutral font-mono text-xs">{log.action}</span>
                  </td>
                  <td className="p-4 text-sm text-slate">
                    {log.entity_table} 
                    {log.entity_id && <span className="text-xs text-slate/60 ml-2">({log.entity_id.slice(0, 8)}...)</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}