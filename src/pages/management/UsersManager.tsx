import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserX, UserCheck, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [linkingUser, setLinkingUser] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState("");

  // Fetch Users
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("profiles") as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch Units
  const { data: units } = useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("units") as any).select("*").order("unit_code");
      if (error) throw error;
      return data;
    },
  });

  // Toggle Active Status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await (supabase.from("profiles") as any).update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  // Confirm Email
  const confirmEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.rpc as any)('admin_confirm_user', { target_user_id: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  // Link Unit
  const linkUnit = useMutation({
    mutationFn: async () => {
      if (!linkingUser || !selectedUnit) return;
      // Remove old links
      await (supabase.from("resident_units") as any).delete().eq("resident_id", linkingUser.id);
      // Insert new link
      const { error } = await (supabase.from("resident_units") as any).insert({
        resident_id: linkingUser.id,
        unit_id: selectedUnit,
        relationship: 'owner'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setLinkingUser(null);
      setSelectedUnit("");
      alert("Unit linked successfully!");
    },
    onError: (err: any) => alert(err.message)
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">User Management</h1>
          <p className="text-slate mt-1">Manage residents, staff, roles, and unit assignments.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-line overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-ivory border-b border-line">
              <tr>
                <th className="p-4 text-xs font-bold text-slate uppercase">Name</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-line last:border-0 hover:bg-ivory/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-navy">{user.full_name}</div>
                    <div className="text-xs text-slate">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="badge-neutral font-mono text-xs">{user.role}</span>
                  </td>
                  <td className="p-4">
                    {user.email_confirmed_at ? (
                      <span className="text-estate text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Confirmed</span>
                    ) : (
                      <span className="text-signal text-xs font-bold">Unconfirmed</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    
                    {/* Confirm Email Button */}
                    {!user.email_confirmed_at && (
                      <button onClick={() => confirmEmail.mutate(user.id)} className="text-xs font-bold bg-gold/10 text-gold px-3 py-1.5 rounded hover:bg-gold hover:text-navy transition">
                        Confirm
                      </button>
                    )}

                    {/* Link Unit Button (Residents only) */}
                    {user.role === 'resident' && (
                      <button onClick={() => setLinkingUser(user)} className="text-xs font-bold bg-navy/10 text-navy px-3 py-1.5 rounded hover:bg-navy hover:text-white transition flex items-center gap-1">
                        <LinkIcon size={12} /> Unit
                      </button>
                    )}

                    {/* Toggle Active Button */}
                    {user.id !== currentUser?.id && (
                      <button 
                        onClick={() => toggleActive.mutate({ id: user.id, is_active: !user.is_active })} 
                        className={`text-xs font-bold px-3 py-1.5 rounded transition ${user.is_active ? 'bg-signal/10 text-signal hover:bg-signal hover:text-white' : 'bg-estate/10 text-estate hover:bg-estate hover:text-white'}`}
                      >
                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LINK UNIT MODAL */}
      <AnimatePresence>
        {linkingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-line">
                <h2 className="text-xl font-bold text-navy">Link Unit</h2>
                <button onClick={() => setLinkingUser(null)} className="text-slate hover:text-signal transition"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate">Assign a unit to <strong className="text-navy">{linkingUser.full_name}</strong>.</p>
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Select Unit</label>
                  <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none">
                    <option value="">-- Choose a unit --</option>
                    {units?.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.unit_code} {u.block_name ? `(${u.block_name})` : ''}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => linkUnit.mutate()} disabled={!selectedUnit || linkUnit.isPending} className="btn-primary w-full flex justify-center items-center gap-2">
                  {linkUnit.isPending ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />} Save Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}