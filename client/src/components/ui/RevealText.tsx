
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RevealTextLineProps {
  words: string[];
  /** gradient for base text — defaults to white→purple */
  baseGradient?: string;
  /** image urls, cycled per letter */
  images?: string[];
  /** stagger delay per letter in seconds */
  letterDelay?: number;
  /** global entrance delay offset in seconds */
  entranceDelay?: number;
  isAppLoading?: boolean;
  animationType?: 'slide-down' | 'slide-up' | 'scale-up' | 'blur-in' | 'fade-in';
  className?: string;
}

// ─── Project-relevant images (code / web / AI / design themed) ──────────────
const PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&q=80", // code editor glow
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80", // coding screen
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", // laptop + code
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80", // terminal dark
  "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80", // web design ui
  "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?w=600&q=80", // figma/ui design
  "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80", // web dev purple
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80", // AI brain network
];

// ─── Single line of reveal letters ──────────────────────────────────────────
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
    if (isAppLoading) return;
    if (!lineRef.current) return;
    const letters = lineRef.current.querySelectorAll<HTMLElement>(".rl-letter");

    // ── Entrance: Dynamic animation settings ──
    const initialProps: gsap.TweenVars = { opacity: 0 };
    const targetProps: gsap.TweenVars = {
      opacity: 1,
      duration: 0.8,
      stagger: { each: letterDelay, from: "start" },
      delay: entranceDelay,
      onComplete() {
        // Color sweep flash across all letters
        const sweeps = lineRef.current!.querySelectorAll<HTMLElement>(".rl-sweep");
        gsap.to(sweeps, {
          opacity: 1,
          duration: 0.07,
          stagger: letterDelay * 0.6,
          ease: "none",
          onComplete() {
            gsap.to(sweeps, { opacity: 0, duration: 0.35, stagger: letterDelay * 0.6, ease: "power2.out" });
          },
        });
      },
    };

    switch (animationType) {
      case "slide-down":
        initialProps.y = -50;
        targetProps.y = 0;
        targetProps.ease = "power3.out";
        break;
      case "slide-up":
        initialProps.y = 50;
        targetProps.y = 0;
        targetProps.ease = "power3.out";
        break;
      case "scale-up":
        initialProps.scale = 0;
        initialProps.rotation = () => gsap.utils.random(-18, 18);
        targetProps.scale = 1;
        targetProps.rotation = 0;
        targetProps.ease = "back.out(2.2)";
        targetProps.duration = 0.65;
        break;
      case "blur-in":
        initialProps.filter = "blur(12px)";
        initialProps.scale = 0.95;
        targetProps.filter = "blur(0px)";
        targetProps.scale = 1;
        targetProps.ease = "power2.out";
        break;
      case "fade-in":
      default:
        targetProps.ease = "power2.out";
        break;
    }

    gsap.set(letters, initialProps);
    gsap.to(letters, targetProps);

    // ── Hover: magnetic lift + image pan ──
    letters.forEach((el) => {
      const imgLayer = el.querySelector<HTMLElement>(".rl-img");
      const base     = el.querySelector<HTMLElement>(".rl-base");

      el.addEventListener("mouseenter", () => {
        gsap.to(el,       { y: -10, scale: 1.13, duration: 0.2, ease: "power2.out" });
        gsap.to(base,     { opacity: 0, duration: 0.1 });
        gsap.to(imgLayer, { opacity: 1, duration: 0.12 });
        gsap.fromTo(imgLayer,
          { backgroundPosition: "0% center" },
          { backgroundPosition: "65% center", duration: 3, ease: "power1.inOut" }
        );
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el,       { y: 0, scale: 1, duration: 0.3, ease: "power2.inOut" });
        gsap.to(base,     { opacity: 1, duration: 0.15 });
        gsap.to(imgLayer, { opacity: 0, duration: 0.2 });
      });
    });
  }, [isAppLoading, animationType, entranceDelay, letterDelay]);

  // Flatten words into letters, preserving spaces
  const fullText = words.join(" ");
  let letterIdx = 0;

  return (
    <div
      ref={lineRef}
      className={`flex items-center justify-center flex-wrap ${className}`}
      style={{ lineHeight: 1 }}
    >
      {fullText.split("").map((char, i) => {
        if (char === " ") {
          return <span key={i} style={{ display: "inline-block", width: "0.28em" }} />;
        }
        const imgUrl = images[letterIdx % images.length];
        letterIdx++;
        return (
          <span
            key={i}
            className="rl-letter relative inline-block overflow-hidden cursor-pointer select-none"
            style={{ opacity: 0 }}
          >
            {/* Base gradient text */}
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

            {/* Image fill on hover */}
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

            {/* Color sweep flash (purple→pink gradient) */}
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

// ─── Main exported component ─────────────────────────────────────────────────
interface RevealTextProps {
  /** Override images for the letters */
  images?: string[];
  isAppLoading?: boolean;
  animationType?: 'slide-down' | 'slide-up' | 'scale-up' | 'blur-in' | 'fade-in';
}

export const RevealText = ({
  images,
  isAppLoading = false,
  animationType = "slide-down",
}: RevealTextProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Line 1: "DESCRIBE YOUR WEBSITE." */}
      <RevealTextLine
        words={["DESCRIBE", "YOUR", "WEBSITE."]}
        baseGradient="linear-gradient(135deg, #ffffff 0%, #c8c2ff 60%, #a89fff 100%)"
        images={images}
        letterDelay={0.065}
        entranceDelay={0.1}
        isAppLoading={isAppLoading}
        animationType={animationType}
        className="text-[clamp(2rem,5vw,3.6rem)] font-bold tracking-tight"
      />

      {/* Line 2: "LET AI BUILD IT." — accent gradient */}
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
    </div>
  );
};

export default RevealText;
