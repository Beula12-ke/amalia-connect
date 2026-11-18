import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { User, Bell, Shield, CheckCircle2, Loader2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export default function UserSettings() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local form state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  
  // Local toggle state
  const [settings, setSettings] = useState({
    notification_email: profile?.notification_email ?? true,
    notification_sms: profile?.notification_sms ?? false,
    sound_alerts: profile?.sound_alerts ?? true,
    hide_phone_from_guard: profile?.hide_phone_from_guard ?? false,
  });

  // Sync local state if profile loads late
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setSettings({
        notification_email: profile.notification_email ?? true,
        notification_sms: profile.notification_sms ?? false,
        sound_alerts: profile.sound_alerts ?? true,
        hide_phone_from_guard: profile.hide_phone_from_guard ?? false,
      });
    }
  }, [profile]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error } = await (supabase as any).from("profiles").update({ full_name: fullName, phone } as ProfileUpdate).eq("id", user.id);
    setSaving(false);
    if (error) setError(error.message);
    else showSaved();
  };

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    if (!user) return;
    // 1. Update UI instantly
    setSettings((prev) => ({ ...prev, [key]: value }));
    
    // 2. Save to Supabase in the background
    const { error } = await (supabase as any).from("profiles").update({ [key]: value } as ProfileUpdate).eq("id", user.id);
    if (error) {
      setError(`Failed to save ${key}. Please check your RLS settings.`);
      // Revert if it fails
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } else {
      showSaved();
    }
  };

  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between py-5 border-b border-line last:border-0">
      <span className="text-navy font-bold">{label}</span>
      
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
          checked ? 'bg-[#C6A15B]' : 'bg-gray-300' 
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Settings</h1>
          <p className="text-slate mt-1">Manage your account preferences and notifications.</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-estate font-bold text-sm bg-estate/10 px-4 py-2 rounded-full">
            <CheckCircle2 size={16} /> Saved
          </motion.div>
        )}
      </div>

      {error && (
        <div className="bg-signal/10 text-signal p-4 rounded-xl mb-6 font-medium text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-[250px_1fr] gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="space-y-2">
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Privacy & Security", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-navy text-white shadow-md' : 'bg-transparent text-slate hover:bg-slate/10 hover:text-navy'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-2xl shadow-premium p-8 border border-line min-h-[400px]">
          
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-bold text-navy mb-4">Profile Information</h2>
              <div>
                <label className="block text-sm font-bold text-slate mb-2">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-line rounded-lg p-3 focus:ring-2 focus:ring-gold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate mb-2">Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-line rounded-lg p-3 focus:ring-2 focus:ring-gold outline-none transition-all" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2 mt-4">
                {saving && <Loader2 size={16} className="animate-spin" />} Save Profile
              </button>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-navy mb-2">Notification Preferences</h2>
              <p className="text-slate text-sm mb-6">Choose how you want to be alerted by the estate.</p>
              <Toggle label="Email Notifications" checked={settings.notification_email} onChange={(v) => handleToggle('notification_email', v)} />
              <Toggle label="SMS Notifications" checked={settings.notification_sms} onChange={(v) => handleToggle('notification_sms', v)} />
              {profile?.role === 'security' && (
                <Toggle label="Sound Alerts for Emergencies" checked={settings.sound_alerts} onChange={(v) => handleToggle('sound_alerts', v)} />
              )}
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-navy mb-2">Privacy & Security</h2>
              <p className="text-slate text-sm mb-6">Control your personal visibility and account security.</p>
              <Toggle label="Hide my phone number from guards" checked={settings.hide_phone_from_guard} onChange={(v) => handleToggle('hide_phone_from_guard', v)} />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}