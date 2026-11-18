import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c3858] via-navy to-[#0a1524]">
      {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
      <motion.img
        src="/logo.png"
        alt="Amalia Connect"
        className="h-20 w-auto object-cover object-center mix-blend-screen drop-shadow-[0_0_20px_rgba(198,161,91,0.5)]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="mt-6 h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-gold">
        Securing your connection...
      </p>
    </div>
  );
}