import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, QrCode, Users, ArrowRight, CheckCircle2, BellRing } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-navy overflow-hidden selection:bg-gold selection:text-navy">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <img src="/logo.png" alt="Amalia Connect" className="h-10 object-contain" />
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2.5 text-white hover:text-gold font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-gold text-navy font-bold rounded-lg hover:bg-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 px-6">
        {/* Background glowing orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-gold text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              Live Secure. Connect Better.
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Smart Estate Management for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Safer Community.</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg">
              Pre-authorise visitors, verify at the gate, and stay connected with your estate team through one premium, seamless platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-8 py-3.5 bg-gold text-navy font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                Resident Login <ArrowRight size={18} />
              </Link>
              <Link to="/visitor-portal" className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/10">
                <QrCode size={18} /> Check Visitor Pass
              </Link>
            </div>
          </motion.div>

          {/* Right: Floating UI Mockups */}
          <div className="relative h-[500px] hidden lg:block">
            {/* Main Floating Pass */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-10 left-10 w-80 bg-white rounded-2xl shadow-2xl p-6 animate-float z-20"
            >
              <div className="flex justify-between items-center mb-6 border-b border-line pb-4">
                <div className="font-bold text-navy">Visitor Pass</div>
                <div className="px-2 py-1 bg-estate/10 text-estate text-xs font-bold rounded-md">APPROVED</div>
              </div>
              <div className="flex flex-col items-center justify-center py-4">
                <QrCode size={100} className="text-navy mb-4" />
                <div className="text-lg font-bold text-navy">Jane Wanjiku</div>
                <div className="text-sm text-slate">Unit A-014 · Today</div>
              </div>
            </motion.div>

            {/* Floating Shield Badge */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-20 right-0 w-48 bg-navy/80 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl animate-float-slow z-10"
            >
              <Shield className="text-gold mb-3" size={32} />
              <div className="text-white font-bold mb-1">Gate Verified</div>
              <div className="text-white/60 text-xs">Identity confirmed securely.</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-gold py-4 overflow-hidden border-y border-yellow-600/30">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-8 text-navy font-bold tracking-widest text-sm uppercase px-4">
              <span>Live Secure. Connect Better.</span>
              <span className="w-2 h-2 rounded-full bg-navy/50"></span>
              <span>Visitor Management</span>
              <span className="w-2 h-2 rounded-full bg-navy/50"></span>
              <span>Gate Verification</span>
              <span className="w-2 h-2 rounded-full bg-navy/50"></span>
              <span>Estate Community</span>
              <span className="w-2 h-2 rounded-full bg-navy/50"></span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-navy mb-4">Everything your estate needs.</h2>
            <p className="text-slate max-w-2xl mx-auto">One platform to manage security, residents, and community operations effortlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Visitor Pre-Registration", desc: "Residents generate secure QR passes for guests, reducing gate delays entirely." },
              { icon: Shield, title: "Secure Gate Verification", desc: "Guards scan passes instantly. Every entry and exit is logged in real-time." },
              { icon: BellRing, title: "Community & Security", desc: "Instant emergency alerts, service requests, and estate-wide announcements." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="card p-8 hover:shadow-premium hover:-translate-y-2 transition-all duration-300 border-t-4 border-t-gold group"
              >
                <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-gold" size={28} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-slate leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy py-8 text-center border-t border-white/10">
        <p className="text-white/50 text-sm">© 2026 Amalia Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
