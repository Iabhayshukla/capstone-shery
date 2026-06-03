import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "../components/ui/Navbar";
import { Sparkles, Zap, Download, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-[var(--text-primary)] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#6C63FF]/20 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#FF6584]/20 blur-[120px]" />
      </div>

      <Navbar />

  
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 gap-8">
   
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

        
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex items-center gap-4"
        >
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 gap-2 glow"
            >
              Start Building Free <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--brand-border)] text-[var(--text-secondary)] hover:bg-[var(--brand-glass-hover)] px-8"
            >
              Login
            </Button>
          </Link>
        </motion.div>

  
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="w-full max-w-4xl mt-8 glass rounded-2xl p-2 glow"
        >
          <div className="w-full h-64 rounded-xl bg-brand-surface flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[var(--text-faint)]">
              <Sparkles size={40} />
              <span className="text-sm">Live Preview will appear here</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
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
                viewport={{ once: true }}
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
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center flex flex-col items-center gap-6 glow"
        >
          <h2 className="text-4xl font-bold text-[var(--text-primary)]">
            Ready to <span className="gradient-text">Build?</span>
          </h2>
          <p className="text-[var(--text-muted)]">
            Join thousands of creators building websites with AI.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-10 gap-2"
            >
              Get Started Free <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-[var(--text-faint)] text-sm border-t border-[var(--brand-border)]">
        © 2025 NovaBuild AI · Sheryians Coding School Capstone
      </footer>
    </div>
  );
};

export default LandingPage;