import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "../components/ui/Navbar";
import BrowserMockup from "../components/ui/BrowserMockup";
import { Sparkles, Zap, Download, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth";
import Particles from "../components/Particles";
import { useTheme } from "@/lib/ThemeContext";
import Marquee from "react-fast-marquee";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 14, delay: i * 0.12 },
  }),
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const particleColors =
    theme === "dark"
      ? ["#ffffff", "#6C63FF", "#FF6584"]
      : ["#1A1A2E", "#6C63FF", "#FF6584"];

  return (
    <div className="min-h-screen bg-brand-dark text-[var(--text-primary)] overflow-hidden relative bg-dot-pattern">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#6C63FF]/20 blur-[120px] animate-float-orb-1" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#FF6584]/20 blur-[120px] animate-float-orb-2" />
        <div className="absolute inset-0 w-full h-full opacity-35">
          <Particles
            particleColors={particleColors}
            particleCount={120}
            particleSpread={10}
            speed={0.15}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
      </div>

      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 gap-8">

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="px-4 py-1.5 rounded-full glass text-[#6C63FF] text-sm font-medium flex items-center gap-2"
        >
          <Sparkles size={14} />
          Next-Gen AI Website Generator
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-6xl font-bold max-w-4xl leading-tight text-[var(--text-primary)]"
        >
          Describe Your Website.
          <br />
          <span className="gradient-text">Let AI Build It.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-[var(--text-muted)] text-lg max-w-2xl"
        >
          Transform a simple prompt into a beautiful, responsive website with
          live preview, instant editing, and one-click export.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex items-center gap-4"
        >
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link to="/dashboard">
                <Button size="lg" className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 gap-2 glow">
                  Go to Dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Link to="/signup">
                  <Button size="lg" className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 gap-2 glow">
                    Start Building Free <ArrowRight size={16} />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-[var(--brand-border)] text-[var(--text-secondary)] hover:bg-[var(--brand-glass-hover)] px-8">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Preview Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="w-full max-w-4xl mt-8 glass rounded-2xl p-2 glow"
        >
          {/* <div className="w-full h-64 rounded-xl bg-brand-surface flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[var(--text-faint)]">
              <Sparkles size={40} />
              <span className="text-sm">Live Preview will appear here</span>
            </div>
          </div> */}
          <div className="w-full h-64 rounded-xl overflow-hidden">
            <BrowserMockup />
          </div>
        </motion.div>
      </section>



      {/* ─── MARQUEE ─── */}
      <div className="relative py-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-brand-dark to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-brand-dark to-transparent pointer-events-none" />
        <Marquee speed={40} gradient={false} pauseOnHover>
          {[
            { icon: <Sparkles size={16} />, label: "Claude AI" },
            { icon: <Zap size={16} />, label: "React" },
            { icon: <Zap size={16} />, label: "Tailwind CSS" },
            { icon: <Download size={16} />, label: "Supabase" },
            { icon: <Sparkles size={16} />, label: "TypeScript" },
            { icon: <Zap size={16} />, label: "Framer Motion" },
            { icon: <Download size={16} />, label: "Vercel" },
            { icon: <Sparkles size={16} />, label: "SSE Streaming" },
            { icon: <Zap size={16} />, label: "shadcn/ui" },
            { icon: <Download size={16} />, label: "One-Click Export" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 mx-6 px-4 py-2 glass rounded-full text-[var(--text-muted)] text-sm hover:text-[#6C63FF] transition-colors cursor-default"
            >
              <span className="text-[#6C63FF]">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </Marquee>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="text-4xl font-bold text-center mb-16 text-[var(--text-primary)]"
          >
            How It <span className="gradient-text">Works</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles size={24} />,
                step: "01",
                title: "Describe It",
                desc: "Type what kind of website you want in plain English. Be as detailed as you like.",
              },
              {
                icon: <Zap size={24} />,
                step: "02",
                title: "AI Generates",
                desc: "Our AI instantly creates a fully styled, responsive webpage just for you.",
              },
              {
                icon: <Download size={24} />,
                step: "03",
                title: "Export & Deploy",
                desc: "Download your code as a ZIP and deploy it anywhere in seconds.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 flex flex-col gap-4 cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-bold text-[var(--text-faint)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center flex flex-col items-center gap-6 glow"
        >
          <h2 className="text-4xl font-bold text-[var(--text-primary)]">
            Ready to <span className="gradient-text">Build?</span>
          </h2>
          <p className="text-[var(--text-muted)]">
            Join thousands of creators building websites with AI.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
            <Button size="lg" className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-10 gap-2">
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}{" "}
              <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-6 text-center text-[var(--text-faint)] text-sm border-t border-[var(--brand-border)]">
        © 2025 NovaBuild AI · Sheryians Coding School Capstone
      </footer>
    </div>
  );
};

export default LandingPage;