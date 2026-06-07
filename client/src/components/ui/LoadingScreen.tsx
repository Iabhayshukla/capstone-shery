import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete?: () => void;
}

// Defined at module level so it is a stable reference and never a useEffect dep.
const STATUSES = [
  "Initializing runtime...",
  "Loading AI models...",
  "Warming up engine...",
  "Almost ready...",
];

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const gridLinesRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const BRAND = "CAPSTONE-SHERY";
  // Keep a ref so the GSAP onComplete callback always calls the latest prop
  // without being listed as a useEffect dependency (GSAP timelines are set up
  // once on mount — re-running the effect on prop changes would reset animations).
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Exit animation
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power3.inOut",
            delay: 0.2,
            onComplete: () => onCompleteRef.current?.(),
          });
        },
      });

      // ── Phase 0: instant setup ──
      gsap.set(lettersRef.current, { opacity: 0, y: 40, rotateX: -90 });
      gsap.set(progressFillRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set([orbRef.current, orb2Ref.current], { scale: 0, opacity: 0 });
      gsap.set(scanlineRef.current, { y: "-100%" });
      gsap.set(cornerRefs.current, { opacity: 0, scale: 0.5 });
      gsap.set(particlesRef.current?.children ?? [], { opacity: 0, scale: 0 });

      // ── Phase 1: Corner brackets burst in ──
      tl.to(cornerRefs.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.07,
        ease: "back.out(2)",
      });

      // ── Phase 2: Orbs bloom ──
      tl.to(
        [orbRef.current, orb2Ref.current],
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.15,
        },
        "<0.1"
      );

      // ── Phase 3: Logo letters cascade in ──
      tl.to(
        lettersRef.current,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.07,
          ease: "back.out(2)",
        },
        "<0.2"
      );

      // ── Phase 4: Scanline sweep ──
      tl.to(
        scanlineRef.current,
        {
          y: "200%",
          duration: 0.7,
          ease: "power2.inOut",
        },
        "<0.3"
      );

      // ── Phase 5: Progress bar ──
      const progressObj = { val: 0 };
      tl.to(
        progressObj,
        {
          val: 100,
          duration: 2.2,
          ease: "power1.inOut",
          onUpdate() {
            const v = Math.round(progressObj.val);
            if (percentRef.current) percentRef.current.textContent = `${v}%`;
            if (progressFillRef.current)
              gsap.set(progressFillRef.current, { scaleX: v / 100 });
            // status label changes
            if (statusRef.current) {
              if (v < 25) statusRef.current.textContent = STATUSES[0];
              else if (v < 55) statusRef.current.textContent = STATUSES[1];
              else if (v < 80) statusRef.current.textContent = STATUSES[2];
              else statusRef.current.textContent = STATUSES[3];
            }
          },
        },
        "<0.1"
      );

      // ── Phase 6: Particles burst ──
      tl.to(
        particlesRef.current?.children ?? [],
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: { each: 0.04, from: "random" },
          ease: "back.out(3)",
        },
        "<0.4"
      );

      // ── Phase 7: Logo pulse on complete ──
      tl.to(
        logoRef.current,
        {
          scale: 1.06,
          duration: 0.2,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        },
        ">"
      );

      // ── Ambient: orb float (infinite, independent) ──
      gsap.to(orbRef.current, {
        y: -30,
        x: 20,
        duration: 3.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        y: 25,
        x: -15,
        duration: 4.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1,
      });

      // ── Ambient: logo letters individual float ──
      lettersRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: gsap.utils.random(-4, 4),
          duration: gsap.utils.random(2, 3.5),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.1,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate random particles
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.5 + 0.15,
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#05050d" }}
    >
      {/* ── Grid overlay ── */}
      <div
        ref={gridLinesRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Scanline ── */}
      <div
        ref={scanlineRef}
        className="absolute inset-x-0 h-[2px] pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(108,99,255,0.8), rgba(0,212,160,0.6), transparent)",
          boxShadow: "0 0 40px 8px rgba(108,99,255,0.3)",
          top: 0,
        }}
      />

      {/* ── Orbs ── */}
      <div
        ref={orbRef}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "-15%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, rgba(108,99,255,0.04) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        ref={orb2Ref}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: "-10%",
          right: "-8%",
          background:
            "radial-gradient(circle, rgba(0,212,160,0.1) 0%, rgba(0,212,160,0.03) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Corner brackets ── */}
      {[
        { top: 24, left: 24, rotate: 0 },
        { top: 24, right: 24, rotate: 90 },
        { bottom: 24, right: 24, rotate: 180 },
        { bottom: 24, left: 24, rotate: 270 },
      ].map(({ rotate, ...styleProps }, i) => (
        <div
          key={i}
          ref={(el) => (cornerRefs.current[i] = el)}
          className="absolute pointer-events-none"
          style={{
            width: 28,
            height: 28,
            transform: `rotate(${rotate}deg)`,
            ...styleProps,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M2 16 L2 2 L16 2"
              stroke="rgba(108,99,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}

      {/* ── Particles ── */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              background:
                p.id % 3 === 0
                  ? "rgba(108,99,255,0.7)"
                  : p.id % 3 === 1
                  ? "rgba(0,212,160,0.6)"
                  : "rgba(255,255,255,0.25)",
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Logo wordmark */}
        <div ref={logoRef} className="flex items-center gap-0 perspective-[600px]">
          {BRAND.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => (lettersRef.current[i] = el)}
              style={{
                display: "inline-block",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: "'DM Sans', 'Sora', sans-serif",
                background:
                  i < 3
                    ? "linear-gradient(135deg, #ffffff 0%, #a89fff 100%)"
                    : i < 6
                    ? "linear-gradient(135deg, #a89fff 0%, #6c63ff 100%)"
                    : "linear-gradient(135deg, #6c63ff 0%, #00d4a0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transformStyle: "preserve-3d",
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.25em",
            color: "rgba(108,99,255,0.7)",
            textTransform: "uppercase",
            marginTop: "-24px",
          }}
        >
          AI Website Builder
        </p>

        {/* Progress section */}
        <div className="flex flex-col items-center gap-3" style={{ width: "min(380px, 80vw)" }}>
          {/* Bar */}
          <div
            ref={progressBarRef}
            style={{
              width: "100%",
              height: 3,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 99,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              ref={progressFillRef}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, #6c63ff, #a89fff, #00d4a0)",
                borderRadius: 99,
                boxShadow: "0 0 12px rgba(108,99,255,0.6)",
              }}
            />
          </div>

          {/* Percent + status row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              ref={statusRef}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.06em",
              }}
            >
              Initializing runtime...
            </span>
            <span
              ref={percentRef}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                color: "rgba(108,99,255,0.8)",
                fontWeight: 600,
              }}
            >
              0%
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom version tag ── */}
      <div
        className="absolute bottom-6"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6rem",
          color: "rgba(255,255,255,0.12)",
          letterSpacing: "0.15em",
        }}
      >
        v1.0.0 · PRODUCTION
      </div>
    </div>
  );
};

export default LoadingScreen;
