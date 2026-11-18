import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export default function UserSettings() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  
  const [settings, setSettings] = useState({
    notification_email: profile?.notification_email ?? true,
    notification_sms: profile?.notification_sms ?? false,
    sound_alerts: profile?.sound_alerts ?? true,
    hide_phone_from_guard: profile?.hide_phone_from_guard ?? false,
    dark_mode: profile?.dark_mode ?? false,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setSettings({
        notification_email: profile.notification_email ?? true,
        notification_sms: profile.notification_sms ?? false,
        sound_alerts: profile.sound_alerts ?? true,
        hide_phone_from_guard: profile.hide_phone_from_guard ?? false,
        dark_mode: profile.dark_mode ?? false,
      });
    }
  }, [profile]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error } = await (supabase as any).from("profiles").update({ full_name: fullName, phone } as ProfileUpdate).eq("id", user.id);
    setSaving(false);
    if (error) setError(error.message);
    else showToast();
  };

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    if (!user) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
    const { error } = await (supabase as any).from("profiles").update({ [key]: value } as ProfileUpdate).eq("id", user.id);
    if (error) {
      setError(`Failed to save ${key}.`);
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } else {
      showToast();
    }
  };

  const TABS = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Privacy & Security", icon: Shield },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {/* HEADER BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy to-[#1c3858] rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-gold text-xs font-bold mb-4 backdrop-blur-md">
            <Sparkles size={14} /> Account Settings
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Your Preferences</h1>
          <p className="text-white/70 max-w-lg">Manage your account information, notification channels, and privacy controls.</p>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-signal/10 text-signal p-4 rounded-xl mb-6 font-medium text-sm">
          {error}
        </motion.div>
      )}

      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="space-y-2 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm transition-colors relative z-10 ${
                  isActive ? 'text-white' : 'text-slate hover:text-navy'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-tab" 
                    className="absolute inset-0 bg-navy rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-3xl shadow-premium p-8 border border-line min-h-[450px]">
          <AnimatePresence mode="wait">
            
            {activeTab === "profile" && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-navy mb-6">Profile Information</h2>
                
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-bold text-slate mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-line rounded-xl p-4 focus:ring-2 focus:ring-gold outline-none transition-all bg-ivory/50 focus:bg-white" />
                </motion.div>
                
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <label className="block text-sm font-bold text-slate mb-2">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-line rounded-xl p-4 focus:ring-2 focus:ring-gold outline-none transition-all bg-ivory/50 focus:bg-white" />
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="pt-4">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} 
                    Save Changes
                  </button>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-navy mb-2">Notification Preferences</h2>
                <p className="text-slate text-sm mb-6">Choose how you want to be alerted by the estate.</p>
                
                <div className="space-y-2">
                  <Toggle label="Email Notifications" checked={settings.notification_email} onChange={(v) => handleToggle('notification_email', v)} />
                  <Toggle label="SMS Notifications" checked={settings.notification_sms} onChange={(v) => handleToggle('notification_sms', v)} />
                  {profile?.role === 'security' && (
                    <Toggle label="Sound Alerts for Emergencies" checked={settings.sound_alerts} onChange={(v) => handleToggle('sound_alerts', v)} />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-navy mb-2">Privacy & Security</h2>
                <p className="text-slate text-sm mb-6">Control your personal visibility and account security.</p>
                
                <div className="space-y-2">
                  <Toggle label="Hide my phone number from guards" checked={settings.hide_phone_from_guard} onChange={(v) => handleToggle('hide_phone_from_guard', v)} />
                  <Toggle label="Dark Mode Interface (Coming Soon)" checked={settings.dark_mode} onChange={(v) => handleToggle('dark_mode', v)} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 bg-navy text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="bg-estate/20 p-2 rounded-full text-estate">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="font-bold text-sm">Success</div>
              <div className="text-white/70 text-xs">Your settings have been saved.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// SPRING-LOADED TOGGLE COMPONENT
const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-line last:border-0 group">
    <span className="text-navy font-bold group-hover:text-gold transition-colors">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
        checked ? 'bg-gold' : 'bg-slate-300' 
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);