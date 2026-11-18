import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  profiles: { full_name: string } | null;
};

export default function ServiceRequests() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState("plumbing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch Resident's Unit
  const { data: unitId } = useQuery<string | null>({
    queryKey: ["my-unit-id", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.from("resident_units") as any).select("unit_id").eq("resident_id", user!.id).single();
      return data?.unit_id || null;
    },
    enabled: !!user?.id,
  });

  // Fetch Requests
  const { data: requests, isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["my-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, profiles!service_requests_assigned_provider_id_fkey(full_name)")
        .eq("resident_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !unitId) {
      setError("Could not find your linked unit. Please contact management.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const { error } = await (supabase.from("service_requests") as any).insert({
      resident_id: user.id,
      unit_id: unitId,
      category,
      title,
      description,
      priority: "normal",
      status: "submitted",
    });

    setIsSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setShowForm(false);
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "submitted") return <span className="badge bg-slate/10 text-slate"><Clock size={12} className="mr-1"/> Searching for Provider</span>;
    if (status === "acknowledged") return <span className="badge bg-amber/10 text-amber"><AlertCircle size={12} className="mr-1"/> Provider Assigned</span>;
    if (status === "in_progress") return <span className="badge bg-navy/10 text-navy"><Loader2 size={12} className="mr-1 animate-spin"/> In Progress</span>;
    if (status === "resolved") return <span className="badge bg-estate/10 text-estate"><CheckCircle2 size={12} className="mr-1"/> Resolved</span>;
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Service Requests</h1>
          <p className="text-slate mt-1">Report maintenance issues and track their progress.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? "Cancel" : <><Plus size={18} /> New Request</>}
        </button>
      </div>

      {error && <div className="bg-signal/10 text-signal p-4 rounded-xl font-medium">{error}</div>}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-premium border border-line mb-6 space-y-4">
              <h2 className="text-xl font-bold text-navy">Submit a New Request</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-line rounded-xl p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none">
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Issue Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Leaking kitchen sink" className="w-full border border-line rounded-xl p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate mb-2">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Provide more details..." className="w-full border border-line rounded-xl p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto px-8 py-3 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Submit Request"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-10 text-slate">Loading requests...</div>
        ) : requests?.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-2xl border border-line border-dashed">
            <Wrench size={48} className="mx-auto text-slate/30 mb-4" />
            <h3 className="text-lg font-bold text-navy mb-1">No requests yet</h3>
            <p className="text-slate text-sm">When you report an issue, it will appear here.</p>
          </div>
        ) : (
          requests?.map((req, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={req.id} className="bg-white p-6 rounded-2xl shadow-premium border border-line">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate bg-ivory px-2 py-1 rounded-md">{req.category}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <h3 className="text-lg font-bold text-navy">{req.title}</h3>
                  <p className="text-slate text-sm mt-1">{req.description}</p>
                  <div className="text-xs text-slate mt-4 flex items-center gap-4">
                    <span>Reported: {new Date(req.created_at).toLocaleDateString()}</span>
                    {req.profiles?.full_name && <span className="font-bold text-gold">Assigned to: {req.profiles.full_name}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}