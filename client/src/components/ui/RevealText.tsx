import { useEffect, useRef } from "react";
import gsap from "gsap";
import Typewriter from "@/components/ui/Typewriter";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RevealTextLineProps {
  words: string[];
  baseGradient?: string;
  images?: string[];
  letterDelay?: number;
  entranceDelay?: number;
  isAppLoading?: boolean;
  animationType?: "slide-down" | "slide-up" | "scale-up" | "blur-in" | "fade-in";
  className?: string;
}

interface RevealTextProps {
  images?: string[];
  isAppLoading?: boolean;
  animationType?: "slide-down" | "slide-up" | "scale-up" | "blur-in" | "fade-in";
}

// ─── Images ──────────────────────────────────────────────────────────────────

const PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
  "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
  "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?w=600&q=80",
  "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80",
];

// ─── RevealTextLine ──────────────────────────────────────────────────────────

const RevealTextLine = ({
  words,
  baseGradient = "linear-gradient(135deg, #ffffff 0%, #c8c2ff 50%, #6c63ff 100%)",
  images = PROJECT_IMAGES,
  letterDelay = 0.07,
  entranceDelay = 0,
  isAppLoading = false,
  animationType = "slide-down",
  className = "",
}: RevealTextLineProps) => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAppLoading || !lineRef.current) return;
    const letters = lineRef.current.querySelectorAll<HTMLElement>(".rl-letter");

    // LIQUID ENTRANCE ANIMATION — letters expand and stretch like liquid pouring in
    const initialProps: gsap.TweenVars = { 
      opacity: 0,
      scaleX: 0,
      scaleY: 0,
      skewX: 0,
      skewY: 0,
    };
    
    const targetProps: gsap.TweenVars = {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      duration: 0.85,
      stagger: { each: letterDelay, from: "start" },
      delay: entranceDelay,
      ease: "elastic.out(1.35)",
      onComplete() {
        const sweeps = lineRef.current!.querySelectorAll<HTMLElement>(".rl-sweep");
        gsap.to(sweeps, {
          opacity: 1,
          duration: 0.07,
          stagger: letterDelay * 0.6,
          ease: "none",
          onComplete() {
            gsap.to(sweeps, {
              opacity: 0,
              duration: 0.35,
              stagger: letterDelay * 0.6,
              ease: "power2.out",
            });
          },
        });

        // CONTINUOUS LIQUID WAVE MOTION after entrance
        letters.forEach((el, idx) => {
          const waveDuration = gsap.utils.random(2.5, 4);
          const delay = idx * 0.08;
          
          // Organic wave morph — up and down with slight stretch
          gsap.to(el, {
            y: () => gsap.utils.random(-8, 8),
            scaleY: () => gsap.utils.random(0.95, 1.08),
            scaleX: () => gsap.utils.random(0.97, 1.03),
            skewX: () => gsap.utils.random(-2, 2),
            duration: waveDuration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay,
          });

          // Rotation liquid ripple effect
          gsap.to(el, {
            rotationZ: () => gsap.utils.random(-3, 3),
            duration: waveDuration * 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay + 0.1,
          });
        });
      },
    };

    gsap.set(letters, initialProps);
    gsap.to(letters, targetProps);

    letters.forEach((el) => {
      const imgLayer = el.querySelector<HTMLElement>(".rl-img");
      const base = el.querySelector<HTMLElement>(".rl-base");

      // HOVER: Explosive liquid splash effect
      el.addEventListener("mouseenter", () => {
        gsap.killTweensOf(el);
        
        // Liquid explosion: burst outward with wild morphing
        const timeline = gsap.timeline();
        timeline.to(el, {
          y: () => gsap.utils.random(-20, -8),
          scaleX: () => gsap.utils.random(1.3, 1.5),
          scaleY: () => gsap.utils.random(1.2, 1.4),
          skewX: () => gsap.utils.random(-15, 15),
          skewY: () => gsap.utils.random(-8, 8),
          rotation: () => gsap.utils.random(-25, 25),
          duration: 0.35,
          ease: "back.out(2)",
        }, 0);

        timeline.to(el, {
          filter: "blur(0.5px) brightness(1.2)",
          duration: 0.2,
        }, 0);

        // Liquid shake while hovered
        gsap.to(el, {
          x: () => gsap.utils.random(-3, 3),
          y: () => gsap.utils.random(-3, 3),
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: "power1.inOut",
          delay: 0.35,
        });

        gsap.to(base, { opacity: 0, duration: 0.15 });
        gsap.to(imgLayer, { opacity: 1, duration: 0.2 });
        gsap.fromTo(
          imgLayer,
          { backgroundPosition: "0% center" },
          { backgroundPosition: "65% center", duration: 3, ease: "power1.inOut" }
        );
      });

      el.addEventListener("mouseleave", () => {
        gsap.killTweensOf(el);
        
        // Liquid reset — smooth return with organic ease
        const timeline = gsap.timeline();
        timeline.to(el, {
          y: 0,
          x: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
          rotation: 0,
          filter: "blur(0px) brightness(1)",
          duration: 0.5,
          ease: "elastic.out(1.1)",
        }, 0);

        // Resume continuous liquid wave
        const waveDuration = gsap.utils.random(2.5, 4);
        gsap.to(el, {
          y: () => gsap.utils.random(-8, 8),
          scaleY: () => gsap.utils.random(0.95, 1.08),
          scaleX: () => gsap.utils.random(0.97, 1.03),
          skewX: () => gsap.utils.random(-2, 2),
          duration: waveDuration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.1,
        });

        gsap.to(el, {
          rotationZ: () => gsap.utils.random(-3, 3),
          duration: waveDuration * 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.2,
        });

        gsap.to(base, { opacity: 1, duration: 0.2 });
        gsap.to(imgLayer, { opacity: 0, duration: 0.25 });
      });
    });
  }, [isAppLoading, animationType, entranceDelay, letterDelay]);

  const fullText = words.join(" ");
  let letterIdx = 0;

  return (
    <div
      ref={lineRef}
      className={`flex items-center justify-center flex-wrap ${className}`}
      style={{ 
        lineHeight: 1,
        perspective: "1500px",
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.08))",
      }}
    >
      {fullText.split("").map((char, i) => {
        if (char === " ") {
          return (
            <span key={i} style={{ display: "inline-block", width: "0.28em" }} />
          );
        }
        const imgUrl = images[letterIdx % images.length];
        letterIdx++;
        return (
          <span
            key={i}
            className="rl-letter relative inline-block overflow-visible cursor-pointer select-none"
            style={{ 
              opacity: 0,
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              willChange: "transform, opacity, filter",
              transition: "none",
            }}
          >
            <span
              className="rl-base block"
              style={{
                background: baseGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {char}
            </span>
            <span
              className="rl-img absolute inset-0 block"
              style={{
                backgroundImage: `url('${imgUrl}')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0% center",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: 0,
              }}
            >
              {char}
            </span>
            <span
              className="rl-sweep absolute inset-0 pointer-events-none block"
              style={{
                background: "linear-gradient(135deg, #6c63ff, #a89fff, #ff6584)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: 0,
              }}
            >
              {char}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ─── SubHeading — word-by-word cinematic reveal ──────────────────────────────

interface SubHeadingWord {
  text: string;
  highlight?: boolean; // glows with accent color + underline draw
}

interface AnimatedSubHeadingProps {
  isAppLoading?: boolean;
  entranceDelay?: number;
}

const SUBHEADING_WORDS: SubHeadingWord[] = [
  { text: "Transform" },
  { text: "a" },
  { text: "simple" },
  { text: "prompt" },
  { text: "into" },
  { text: "a" },
  { text: "beautiful,", highlight: true },
  { text: "responsive", highlight: true },
  { text: "website", highlight: true },
  { text: "with" },
  { text: "live", highlight: true },
  { text: "preview," },
  { text: "instant" },
  { text: "editing," },
  { text: "and" },
  { text: "one-click", highlight: true },
  { text: "export." },
];

const AnimatedSubHeading = ({
  isAppLoading = false,
  entranceDelay = 1.3,
}: AnimatedSubHeadingProps) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isAppLoading || !containerRef.current) return;

    const words = containerRef.current.querySelectorAll<HTMLElement>(".sub-word");
    const underlines =
      containerRef.current.querySelectorAll<HTMLElement>(".sub-underline");

    // Step 1 — all words start invisible, slightly below
    gsap.set(words, { opacity: 0, y: 18, filter: "blur(4px)" });

    // Step 2 — staggered word reveal
    gsap.to(words, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.55,
      stagger: 0.045,
      ease: "power3.out",
      delay: entranceDelay,
    });

    // Step 3 — underlines draw in after words land
    gsap.set(underlines, { scaleX: 0, transformOrigin: "left center" });
    gsap.to(underlines, {
      scaleX: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: "power2.inOut",
      delay: entranceDelay + SUBHEADING_WORDS.length * 0.045 + 0.1,
    });

    // Step 4 — highlight words get a soft glow pulse after underline
    const highlights =
      containerRef.current.querySelectorAll<HTMLElement>(".sub-highlight-text");
    gsap.to(highlights, {
      textShadow: "0 0 20px rgba(108,99,255,0.55)",
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2,
      delay: entranceDelay + 0.8,
    });

    // Step 5 — hover: each word lifts slightly
    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        gsap.to(word, { y: -3, scale: 1.06, duration: 0.18, ease: "power2.out" });
      });
      word.addEventListener("mouseleave", () => {
        gsap.to(word, { y: 0, scale: 1, duration: 0.25, ease: "power2.inOut" });
      });
    });
  }, [isAppLoading]);

  return (
    <p
      ref={containerRef}
      className="text-[var(--text-muted)] text-lg max-w-2xl leading-relaxed text-center flex flex-wrap justify-center gap-x-[0.32em] gap-y-1"
    >
      {SUBHEADING_WORDS.map((word, i) => (
        <span
          key={i}
          className="sub-word relative inline-block cursor-default select-none"
          style={{ opacity: 0 }}
        >
          {word.highlight ? (
            <>
              {/* Highlighted word — accent color + underline */}
              <span
                className="sub-highlight-text relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #a89fff 0%, #6c63ff 50%, #ff6584 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 500,
                }}
              >
                {word.text}
              </span>
              {/* Underline that draws in */}
              <span
                className="sub-underline absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #6c63ff, #ff6584)",
                  display: "block",
                  transform: "scaleX(0)",
                  transformOrigin: "left center",
                }}
              />
            </>
          ) : (
            <span
              className="relative z-10"
              style={{ color: "var(--text-muted)" }}
            >
              {word.text}
            </span>
          )}
        </span>
      ))}
    </p>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export const RevealText = ({
  images,
  isAppLoading = false,
  animationType = "slide-down",
}: RevealTextProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Line 1 — Typewriter */}
      <div
        className="text-[clamp(2rem,5vw,3.6rem)] font-bold tracking-tight text-center"
        style={{ minHeight: "1.2em" }}
      >
        <Typewriter
          text={[
            "DESCRIBE YOUR WEBSITE.",
            "TYPE YOUR VISION.",
            "IMAGINE. WE BUILD.",
            "PROMPT TO PRODUCTION.",
          ]}
          speed={80}
          deleteSpeed={40}
          delay={2500}
          loop
          cursor="_"
          className=""
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #c8c2ff 60%, #a89fff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        />
      </div>

      {/* Line 2 */}
      <RevealTextLine
        words={["LET", "AI", "BUILD", "IT."]}
        baseGradient="linear-gradient(135deg, #6c63ff 0%, #a89fff 40%, #ff6584 80%, #6c63ff 100%)"
        images={images}
        letterDelay={0.07}
        entranceDelay={0.55}
        isAppLoading={isAppLoading}
        animationType={animationType}
        className="text-[clamp(2rem,5vw,3.6rem)] font-bold tracking-tight"
      />

      {/* Animated subheading — replaces the old <p> tag in LandingPage */}
      <AnimatedSubHeading isAppLoading={isAppLoading} entranceDelay={1.3} />
    </div>
  );
};

export default RevealText;
