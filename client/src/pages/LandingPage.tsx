import { useEffect, useRef } from "react";
import { useCursor } from "@/components/ui/useCursor";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "../components/ui/Navbar";
import BrowserMockup from "../components/ui/BrowserMockup";
import { Sparkles, Zap, Download, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth";
import DotField from "../components/DotField";
import Marquee from "react-fast-marquee";
import RevealText from "@/components/ui/RevealText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 14, delay: i * 0.12 },
  }),
};

interface LandingPageProps {
  isAppLoading?: boolean;
}

const LandingPage = ({ isAppLoading = false }: LandingPageProps) => {
  const { isAuthenticated } = useAuth();
  useCursor();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const pageRef           = useRef<HTMLDivElement>(null);
  const heroPreviewRef    = useRef<HTMLDivElement>(null);
  const marqueeWrapRef    = useRef<HTMLDivElement>(null);

  // Hero text
  const heroBadgeRef      = useRef<HTMLDivElement>(null);
  const heroSubRef        = useRef<HTMLParagraphElement>(null);
  const heroCtaRef        = useRef<HTMLDivElement>(null);

  // How it works
  const howSectionRef     = useRef<HTMLElement>(null);
  const howHeadingRef     = useRef<HTMLHeadingElement>(null);
  const howCardsRef       = useRef<(HTMLDivElement | null)[]>([]);
  const howLineRef        = useRef<HTMLDivElement>(null);

  // Steps numbers (big floating)
  const stepNumRefs       = useRef<(HTMLSpanElement | null)[]>([]);

  // CTA banner
  const ctaBannerRef      = useRef<HTMLDivElement>(null);
  const ctaHeadingRef     = useRef<HTMLHeadingElement>(null);

  // Orbs
  const orb1Ref           = useRef<HTMLDivElement>(null);
  const orb2Ref           = useRef<HTMLDivElement>(null);

  // ── GSAP ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAppLoading) return;
    const ctx = gsap.context(() => {

      // ── 0. Hero badge — bounce in ─────────────────────────────────────────
      if (heroBadgeRef.current) {
        gsap.fromTo(heroBadgeRef.current,
          { opacity: 0, y: -20, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)", delay: 0.1 }
        );
        // Ambient shimmer pulse on badge
        gsap.to(heroBadgeRef.current, {
          boxShadow: "0 0 24px 6px rgba(108,99,255,0.35)",
          duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1,
        });
      }


      // ── 0c. Subheading — fade up with highlight words stagger ────────────
      if (heroSubRef.current) {
        gsap.fromTo(heroSubRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.85 }
        );
        // highlight spans inside subheading
        const highlights = heroSubRef.current.querySelectorAll(".hero-highlight");
        if (highlights.length) {
          gsap.fromTo(highlights,
            { backgroundSize: "0% 100%" },
            { backgroundSize: "100% 100%", duration: 0.6, stagger: 0.15, ease: "power2.out", delay: 1.2 }
          );
        }
      }

      // ── 0d. CTA buttons — slide up staggered ─────────────────────────────
      if (heroCtaRef.current) {
        const btns = heroCtaRef.current.querySelectorAll(".hero-btn");
        gsap.fromTo(btns,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.12, ease: "back.out(1.5)", delay: 1.1 }
        );
      }

      // ── 1. Hero preview — gentle parallax, no fade ───────────────────────
      if (heroPreviewRef.current) {
        gsap.to(heroPreviewRef.current, {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: heroPreviewRef.current,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 2,
          },
        });
      }

      // ── 2. Orbs parallax (independent speeds) ────────────────────────────
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          y: 200,
          ease: "none",
          scrollTrigger: { trigger: pageRef.current, start: "top top", end: "bottom bottom", scrub: 2 },
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          y: -180,
          ease: "none",
          scrollTrigger: { trigger: pageRef.current, start: "top top", end: "bottom bottom", scrub: 3 },
        });
      }

      // ── 3. Marquee strip — slide in from left ────────────────────────────
      if (marqueeWrapRef.current) {
        gsap.fromTo(
          marqueeWrapRef.current,
          { opacity: 0, x: -60 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: marqueeWrapRef.current, start: "top 88%", toggleActions: "play none none reverse" },
          }
        );
      }

      // ── 4. "How It Works" heading — simple fade+slide reveal ────────────
      if (howHeadingRef.current) {
        gsap.fromTo(
          howHeadingRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, ease: "power3.out",
            scrollTrigger: {
              trigger: howHeadingRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── 5. Horizontal connector line between cards ────────────────────────
      if (howLineRef.current) {
        gsap.fromTo(
          howLineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1, duration: 1.2, ease: "power2.inOut",
            scrollTrigger: { trigger: howLineRef.current, start: "top 80%", toggleActions: "play none none reverse" },
          }
        );
      }

      // ── 6. Step cards — staggered cascade with 3D flip ───────────────────
      const validCards = howCardsRef.current.filter(Boolean);
      if (validCards.length) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 80, rotateY: -15, scale: 0.9 },
          {
            opacity: 1, y: 0, rotateY: 0, scale: 1,
            duration: 0.7, stagger: 0.18, ease: "power3.out",
            scrollTrigger: {
              trigger: howSectionRef.current,
              start: "top 72%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── 7. Step numbers — count-up float ─────────────────────────────────
      stepNumRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.4, y: 20 },
          {
            opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(3)",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
          }
        );
      });

      // ── 8. CTA banner — scale reveal + glow pulse ────────────────────────
      if (ctaBannerRef.current) {
        gsap.fromTo(
          ctaBannerRef.current,
          { opacity: 0, scale: 0.88, y: 60 },
          {
            opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: {
              trigger: ctaBannerRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Ambient glow pulse on the banner
        gsap.to(ctaBannerRef.current, {
          boxShadow: "0 0 80px 20px rgba(108,99,255,0.25), 0 0 160px 40px rgba(108,99,255,0.1)",
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 1,
        });
      }

      // ── 9. CTA heading — word spans stagger (no SplitText needed) ──────────
      if (ctaHeadingRef.current) {
        const words = ctaHeadingRef.current.querySelectorAll(".cta-word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
            scrollTrigger: {
              trigger: ctaHeadingRef.current,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── 10. Floating icon dots on step cards (ambient) ───────────────────
      validCards.forEach((card, i) => {
        if (!card) return;
        const icon = card.querySelector(".step-icon");
        if (!icon) return;
        gsap.to(icon, {
          y: -8,
          duration: 2 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });

    }, pageRef);

    return () => ctx.revert();
  }, [isAppLoading]);

  return (
    <div
      ref={pageRef}
      className="landing-page min-h-screen bg-brand-dark text-[var(--text-primary)] overflow-hidden relative"
    >
      {/* Custom cursor elements */}
      <div id="cur" />
      <div id="curR" />
      {/* ─── Background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          ref={orb1Ref}
          className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#6C63FF]/20 blur-[120px] animate-float-orb-1"
        />
        <div
          ref={orb2Ref}
          className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#FF6584]/20 blur-[120px] animate-float-orb-2"
        />
        <div className="absolute inset-0 w-full h-full opacity-80 pointer-events-none">
          <DotField
            dotRadius={1.8}
            dotSpacing={14}
            bulgeStrength={67}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="#A855F7"
            gradientTo="#B497CF"
            glowColor="#120F17"
          />
        </div>
      </div>

      <Navbar />

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 gap-8">

        {/* Badge — magnetic shimmer */}
        <div
          ref={heroBadgeRef}
          className="px-4 py-1.5 rounded-full glass text-[#6C63FF] text-sm font-medium flex items-center gap-2 cursor-default select-none"
          style={{ opacity: 0 }}
        >
          <Sparkles size={14} />
          Next-Gen AI Website Generator
        </div>

        {/* Heading — RevealText component */}
        <RevealText isAppLoading={isAppLoading} />

        {/* Subheading — key words highlighted */}
        {/* <p
          ref={heroSubRef}
          className="text-[var(--text-muted)] text-lg max-w-2xl leading-relaxed"
          style={{ opacity: 0 }}
        >
          Transform a simple prompt into a{" "}
          <span
            className="hero-highlight text-[var(--text-primary)] font-medium relative"
            style={{
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 88%",
              backgroundSize: "0% 2px",
              paddingBottom: "2px",
            }}
          >
            beautiful, responsive website
          </span>{" "}
          with{" "}
          <span
            className="hero-highlight text-[var(--text-primary)] font-medium relative"
            style={{
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 88%",
              backgroundSize: "0% 2px",
              paddingBottom: "2px",
            }}
          >
            live preview
          </span>
          , instant editing, and one-click export.
        </p> */}

        {/* CTAs */}
        <div ref={heroCtaRef} className="flex items-center gap-4">
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="hero-btn inline-block">
              <Link to="/dashboard">
                <Button size="lg" className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 gap-2 glow">
                  Go to Dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="hero-btn inline-block">
                <Link to="/signup">
                  <Button size="lg" className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 gap-2 glow">
                    Start Building Free <ArrowRight size={16} />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="hero-btn inline-block">
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-[var(--brand-border)] text-[var(--text-secondary)] hover:bg-[var(--brand-glass-hover)] px-8">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Preview Card — parallax out on scroll */}
        <motion.div
          ref={heroPreviewRef}
          variants={fadeUp} initial="hidden" animate={isAppLoading ? "hidden" : "show"} custom={4}
          className="w-full max-w-4xl mt-8 glass rounded-2xl p-2 glow"
        >
          <div className="w-full h-64 rounded-xl overflow-hidden">
            <BrowserMockup />
          </div>
        </motion.div>
      </section>

      {/* ─── MARQUEE ────────────────────────────────────────────────── */}
      <div ref={marqueeWrapRef} className="relative py-6 overflow-hidden">
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

      {/* ─── HOW IT WORKS ───────────────────────────────────────────── */}
      <section ref={howSectionRef} className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">

          <h2
            ref={howHeadingRef}
            className="text-4xl font-bold text-center mb-16 text-[var(--text-primary)]"
            style={{ perspective: "600px" }}
          >
            How It <span className="gradient-text">Works</span>
          </h2>

          {/* Connector line */}
          <div className="relative mb-0">
            <div
              ref={howLineRef}
              className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-px z-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(108,99,255,0.4), rgba(108,99,255,0.4), transparent)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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
              <div
                key={i}
                ref={(el) => (howCardsRef.current[i] = el)}
                className="glass rounded-2xl p-6 flex flex-col gap-4 cursor-default"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex items-center justify-between">
                  <div className="step-icon w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
                    {item.icon}
                  </div>
                  <span
                    ref={(el) => (stepNumRefs.current[i] = el)}
                    className="text-4xl font-bold text-[var(--text-faint)]"
                  >
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div
          ref={ctaBannerRef}
          className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center flex flex-col items-center gap-6"
        >
          <h2
            ref={ctaHeadingRef}
            className="text-4xl font-bold text-[var(--text-primary)]"
          >
            <span className="cta-word inline-block">Ready</span>{" "}
            <span className="cta-word inline-block">to</span>{" "}
            <span className="cta-word inline-block gradient-text">Build?</span>
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
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-[var(--text-faint)] text-sm border-t border-[var(--brand-border)]">
        © 2025 NovaBuild AI · CAPSTONE-SHERY
      </footer>
    </div>
  );
};

export default LandingPage;
