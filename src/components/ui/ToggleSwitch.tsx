import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      role="button"
      tabIndex={0}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-line bg-white cursor-pointer transition-colors hover:bg-navy/5 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1"
    >
      <div className="flex flex-col gap-1 leading-none">
        <span className="text-sm font-medium text-navy">{label}</span>
        {description && <span className="text-xs text-slate">{description}</span>}
      </div>
      <motion.div
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
          checked ? "bg-gold" : "bg-slate-300"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1 left-1"
        />
      </motion.div>
    </div>
  );
}