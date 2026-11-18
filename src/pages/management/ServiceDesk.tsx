import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Wrench, Loader2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  units: { unit_code: string } | null;
  resident: { full_name: string } | null;
  provider: { full_name: string } | null;
};

export default function ServiceDesk() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["admin-service-requests"],
    queryFn: async () => {
      // Simple, bulletproof fetch
      const { data, error } = await (supabase.from("service_requests") as any)
        .select(`
          *,
          units (unit_code),
          resident:profiles!resident_id (full_name),
          provider:profiles!assigned_provider_id (full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    await (supabase.from("service_requests") as any).update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-service-requests"] });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Service Desk</h1>
          <p className="text-slate mt-1">Monitor and manage all estate maintenance requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-line overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate flex flex-col items-center">
            <Loader2 className="animate-spin text-gold mb-4" size={32} />
            Loading requests...
          </div>
        ) : requests?.length === 0 ? (
          <div className="p-10 text-center text-slate">
            No service requests found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-ivory border-b border-line">
              <tr>
                <th className="p-4 text-xs font-bold text-slate uppercase">Request</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Resident</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Unit</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Provider</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests?.map((req, i) => (
                <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={req.id} className="border-b border-line last:border-0 hover:bg-ivory/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-navy">{req.title}</div>
                    <div className="text-xs text-slate truncate max-w-[200px]">{req.description}</div>
                  </td>
                  <td className="p-4 text-sm text-slate">{req.resident?.full_name || "Unknown"}</td>
                  <td className="p-4 text-sm font-bold text-navy">{req.units?.unit_code || "—"}</td>
                  <td className="p-4"><span className="badge-neutral capitalize">{req.category}</span></td>
                  <td className="p-4 text-sm font-bold text-gold">{req.provider?.full_name || "Unassigned"}</td>
                  <td className="p-4">
                    <span className={`badge ${req.status === 'submitted' ? 'bg-slate/10 text-slate' : req.status === 'resolved' ? 'bg-estate/10 text-estate' : 'bg-amber/10 text-amber'} capitalize`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={req.status} 
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="text-xs border border-line rounded-md p-1 bg-white focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
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