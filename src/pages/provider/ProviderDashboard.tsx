import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Clock, CheckCircle2, Loader2, PlayCircle, Bell } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ProviderStatus = Database["public"]["Tables"]["provider_status"]["Row"];
type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  units: { unit_code: string } | null;
  resident: { full_name: string } | null;
};

export default function ProviderDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 1. Fetch Provider Status
  const { data: statusData } = useQuery<ProviderStatus>({
    queryKey: ["provider-status", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.from("provider_status") as any).select("*").eq("provider_id", user!.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  // 2. Fetch Jobs (Unassigned matching category OR assigned to me)
  const { data: jobs, isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["provider-jobs", user?.id],
    queryFn: async () => {
      // We use ilike for case-insensitive matching (e.g., 'Plumbing' matches 'plumbing')
      const { data, error } = await (supabase.from("service_requests") as any)
        .select(`
          *,
          units (unit_code),
          resident:profiles!resident_id (full_name)
        `)
        .or(`and(status.eq.submitted,category.ilike.${profile?.service_category}),assigned_provider_id.eq.${user?.id}`)
        .order("created_at", { ascending: true });
        
      if (error) {
        console.error("Provider Fetch Error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!profile?.service_category,
  });

  // 3. Real-Time Listener for New Jobs
  useEffect(() => {
    if (!profile?.service_category) return;

    // Request browser notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("new-jobs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "service_requests", filter: `category=eq.${profile.service_category}` },
        (payload) => {
          // Refresh the job list
          queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
          
          // Send a native browser notification
          if (Notification.permission === "granted") {
            new Notification("New Service Request!", {
              body: `A resident needs help with: ${payload.new.title}`,
              icon: "/logo.png"
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.service_category, queryClient]);

  // 4. Toggle Status Mutation
  const toggleStatus = async () => {
    if (!user || !profile) return;
    let newStatus = "available";
    if (statusData?.current_status === "available") newStatus = "busy";
    if (statusData?.current_status === "busy") newStatus = "offline";
    
    setUpdatingStatus(true);
    await (supabase.from("provider_status") as any).upsert({
      provider_id: user.id,
      category: profile.service_category || "General",
      current_status: newStatus,
      updated_at: new Date().toISOString()
    }, { onConflict: "provider_id" });
    
    queryClient.invalidateQueries({ queryKey: ["provider-status"] });
    setUpdatingStatus(false);
  };

  // 5. Claim Job Mutation
  const claimJob = async (jobId: string) => {
    if (!user || !profile) return;
    
    // 1. Assign the job to the provider
    await (supabase.from("service_requests") as any).update({
      assigned_provider_id: user.id,
      status: "acknowledged"
    }).eq("id", jobId);

    // 2. Automatically set their status to 'busy'
    await (supabase.from("provider_status") as any).upsert({
      provider_id: user.id,
      category: profile.service_category || "General",
      current_status: "busy",
      updated_at: new Date().toISOString()
    }, { onConflict: "provider_id" });

    // 3. Refresh both the job list and the status bar
    queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["provider-status"] });
  };

  // 6. Update Job Status
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    if (!user || !profile) return;
    
    // 1. Update the job status
    await (supabase.from("service_requests") as any).update({ status: newStatus }).eq("id", jobId);

    // 2. If the job is completed, set their status back to 'available'
    if (newStatus === 'resolved') {
      await (supabase.from("provider_status") as any).upsert({
        provider_id: user.id,
        category: profile.service_category || "General",
        current_status: "available",
        updated_at: new Date().toISOString()
      }, { onConflict: "provider_id" });
    }

    // 3. Refresh both the job list and the status bar
    queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["provider-status"] });
  };

  const currentStatus = statusData?.current_status || "offline";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Welcome, {profile?.full_name}</h1>
        <p className="text-slate mt-1 capitalize">{profile?.service_category} Provider</p>
      </div>

      {/* STATUS TOGGLE */}
      <motion.button 
        onClick={toggleStatus} 
        disabled={updatingStatus}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-8 rounded-3xl text-white shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          currentStatus === 'available' ? 'bg-estate' : currentStatus === 'busy' ? 'bg-amber' : 'bg-slate-500'
        }`}
      >
        {updatingStatus ? <Loader2 className="animate-spin" size={32} /> : (
          <>
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {currentStatus}
            </div>
            <div className="text-3xl font-extrabold">Tap to change availability</div>
          </>
        )}
      </motion.button>

      {/* TASK QUEUE */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-gold" /> Job Queue <span className="bg-navy/10 text-navy text-xs px-2 py-1 rounded-full">{jobs?.length || 0}</span>
        </h2>
        
        {isLoading ? (
          <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-gold" /></div>
        ) : jobs?.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-line text-center text-slate">
            No jobs available right now. We will alert you when a resident needs a {profile?.service_category}.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs?.map((job) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={job.id} className="bg-white p-6 rounded-2xl shadow-premium border border-line">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-navy/5 text-navy text-xs font-bold px-2 py-1 rounded">Unit {job.units?.unit_code || "Unknown"}</span>
                      <span className="text-xs text-slate font-medium">Reported by {job.resident?.full_name || "Resident"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy">{job.title}</h3>
                    <p className="text-slate text-sm mt-1">{job.description}</p>
                  </div>
                </div>

                {job.status === 'submitted' ? (
                  <button onClick={() => claimJob(job.id)} className="bg-navy text-white px-6 py-2 rounded-lg font-bold hover:bg-gold hover:text-navy transition-colors w-full md:w-auto">
                    Claim This Job
                  </button>
                ) : job.status === 'acknowledged' ? (
                  <button onClick={() => updateJobStatus(job.id, 'in_progress')} className="bg-amber text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                    <PlayCircle size={18} /> Start Work
                  </button>
                ) : job.status === 'in_progress' ? (
                  <button onClick={() => updateJobStatus(job.id, 'resolved')} className="bg-estate text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Mark as Complete
                  </button>
                ) : (
                  <span className="text-estate font-bold flex items-center gap-2 text-sm"><CheckCircle2 size={16} /> Completed</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}