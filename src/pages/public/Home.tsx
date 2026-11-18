import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, QrCode, Users, ArrowRight, BellRing, ChevronDown, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060c14] overflow-hidden selection:bg-gold selection:text-navy font-sans">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#060c14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
          <img src="/logo.png" alt="Amalia Connect" className="h-14 md:h-16 w-auto object-cover object-center mix-blend-screen scale-[1.15] drop-shadow-[0_0_15px_rgba(198,161,91,0.3)] transition-transform hover:scale-[1.2]" />
          <div className="flex gap-4">
            <Link to="/provider/apply" className="px-5 py-2.5 text-gold hover:text-white font-medium transition-colors hidden md:block">
              Become a Provider
            </Link>
            <Link to="/login" className="px-5 py-2.5 text-white hover:text-gold font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-gold text-navy font-bold rounded-lg hover:bg-white transition-colors shadow-[0_0_15px_rgba(198,161,91,0.3)]">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION - HIGH VISIBILITY ANIMATED BACKGROUND */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 px-6 overflow-hidden bg-[#060c14]">
        
        {/* 1. The Moving Tech Grid (Increased visibility) */}
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: 'center center',
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)'
          }}
        />

        {/* 2. Animated Glowing Orbs (Larger, brighter, less blur) */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
            x: [0, 80, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/40 rounded-full blur-[90px] z-0 pointer-events-none"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -80, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/30 rounded-full blur-[100px] z-0 pointer-events-none"
        />

        {/* 3. Floating Tech Nodes (Bigger, brighter, glowing) */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0],
              opacity: [0.4, 1, 0.4] 
            }}
            transition={{ 
              duration: 3 + (i % 3), 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.3
            }}
            className="absolute z-10 w-3 h-3 rounded-full bg-gold shadow-[0_0_20px_4px_rgba(198,161,91,0.6)]"
            style={{ 
              top: `${15 + i * 10}%`, 
              left: `${5 + (i * 12)}%` 
            }}
          />
        ))}

        {/* 4. Content Container (Z-20 ensures it's above the background) */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-20">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-gold text-sm font-medium mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
              Live Secure. Connect Better.
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl">
              Smart Estate Management for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Safer Community.</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg font-medium drop-shadow-lg">
              Pre-authorise visitors, verify at the gate, and stay connected with your estate team through one premium, seamless platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-8 py-3.5 bg-gold text-navy font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(198,161,91,0.4)]">
                Resident Login <ArrowRight size={18} />
              </Link>
              <Link to="/visitor-portal" className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md">
                <QrCode size={18} /> Check Visitor Pass
              </Link>
            </div>
          </motion.div>

          {/* Right: Floating UI Mockups */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-10 left-10 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 animate-float z-20"
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

            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-20 right-0 w-48 bg-navy/90 backdrop-blur-xl border border-gold/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(198,161,91,0.15)] animate-float-slow z-20"
            >
              <Shield className="text-gold mb-3" size={32} />
              <div className="text-white font-bold mb-1">Gate Verified</div>
              <div className="text-white/60 text-xs">Identity confirmed securely.</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-gold py-4 overflow-hidden border-y border-yellow-600/30 relative z-30">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[1, 2].map((group) => (
            <div key={group} className="flex items-center gap-8 text-navy font-bold tracking-widest text-sm uppercase px-4">
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
      <section className="py-32 px-6 bg-ivory relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-navy mb-4 tracking-tight">Everything your estate needs.</h2>
            <p className="text-slate max-w-2xl mx-auto text-lg">One platform to manage security, residents, and community operations effortlessly.</p>
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
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card p-10 hover:shadow-premium hover:-translate-y-2 transition-all duration-300 border-t-4 border-t-transparent hover:border-t-gold group bg-white"
              >
                <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-navy/20">
                  <feature.icon className="text-gold" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-4">{feature.title}</h3>
                <p className="text-slate leading-relaxed text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy py-12 text-center border-t border-white/10 relative z-20">
        {/* Refined Logo: Blend screen applied to remove dark background and enhance gold/ivory visibility */}
        <img src="/logo.png" alt="Amalia Connect" className="h-14 md:h-16 w-auto object-cover object-center mix-blend-screen scale-[1.15] drop-shadow-[0_0_15px_rgba(198,161,91,0.3)] transition-transform hover:scale-[1.2]" />
        <p className="text-white/40 text-sm mt-4">© 2026 Amalia Connect. All rights reserved.</p>
        <p className="mt-4">
          <Link to="/provider/apply" className="text-gold hover:underline font-medium text-sm">Apply as a Service Provider</Link>
        </p>
      </footer>
    </div>
  );
}