import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserX, UserCheck, Link as LinkIcon, X, Loader2, Plus, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [linkingUser, setLinkingUser] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("security");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: units } = useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*").order("unit_code");
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const confirmEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('admin_confirm_user', { target_user_id: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const linkUnit = useMutation({
    mutationFn: async () => {
      if (!linkingUser || !selectedUnit) return;
      await supabase.from("resident_units").delete().eq("resident_id", linkingUser.id);
      const { error } = await supabase.from("resident_units").insert({ resident_id: linkingUser.id, unit_id: selectedUnit, relationship: 'owner' });
      if (error) throw error;
    },
    onSuccess: () => {
      setLinkingUser(null);
      setSelectedUnit("");
      alert("Unit linked successfully!");
    },
    onError: (err: any) => alert(err.message)
  });

  const createStaff = useMutation({
    mutationFn: async () => {
      setFormError(null);
      const { error } = await supabase.rpc('admin_create_staff', {
        staff_email: staffEmail,
        staff_password: staffPassword,
        staff_name: staffName,
        staff_role: staffRole
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsAddingStaff(false);
      setStaffName(""); setStaffEmail(""); setStaffPassword(""); setStaffRole("security");
      alert("Staff member created successfully!");
    },
    onError: (err: any) => setFormError(err.message)
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">User Management</h1>
          <p className="text-slate mt-1">Manage residents, security guards, and system roles.</p>
        </div>
        <button onClick={() => setIsAddingStaff(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Staff Member
        </button>
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
              {users?.map((user) => (
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
                    {!user.email_confirmed_at && (
                      <button onClick={() => confirmEmail.mutate(user.id)} className="text-xs font-bold bg-gold/10 text-gold px-3 py-1.5 rounded hover:bg-gold hover:text-navy transition">
                        Confirm
                      </button>
                    )}

                    {user.role === 'resident' && (
                      <button onClick={() => setLinkingUser(user)} className="text-xs font-bold bg-navy/10 text-navy px-3 py-1.5 rounded hover:bg-navy hover:text-white transition flex items-center gap-1">
                        <LinkIcon size={12} /> Unit
                      </button>
                    )}

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

      <AnimatePresence>
        {isAddingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-line">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2"><Shield size={20} className="text-gold"/> Create Staff Account</h2>
                <button onClick={() => setIsAddingStaff(false)} className="text-slate hover:text-signal transition"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {formError && <div className="bg-signal/10 text-signal p-3 rounded-lg text-sm font-bold">{formError}</div>}

                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Full Name</label>
                  <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none" placeholder="e.g., John Guard" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Email Address</label>
                  <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none" placeholder="guard@amalia.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Temporary Password</label>
                  <input type="text" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none" placeholder="Password123!" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate mb-2">Role</label>
                  <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-ivory/50 focus:bg-white focus:ring-2 focus:ring-gold outline-none">
                    <option value="security">Security Guard (Gate Console)</option>
                    <option value="estate_manager">Estate Manager</option>
                    <option value="estate_admin">Estate Admin</option>
                  </select>
                </div>

                <button onClick={() => createStaff.mutate()} disabled={createStaff.isPending || !staffEmail || !staffPassword || !staffName} className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
                  {createStaff.isPending ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    {units?.map(u => (
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