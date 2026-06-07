import { useEffect } from "react";

export const useCursor = () => {
  useEffect(() => {
    const cur = document.getElementById("cur");
    const curR = document.getElementById("curR");
    if (!cur || !curR) return;

    let mx = -200, my = -200, rx = -200, ry = -200;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cur.style.left = mx + "px";
      cur.style.top = my + "px";
      curR.style.left = rx + "px";
      curR.style.top = ry + "px";
      raf = requestAnimationFrame(loop);
    };

    const onEnter = () => {
      cur.style.opacity = "0";
      curR.style.opacity = "0";
    };

    const onLeave = () => {
      cur.style.opacity = "1";
      curR.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    // Initial targets
    let targets = document.querySelectorAll("button, a");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    // MutationObserver so newly mounted buttons/links also get the effect
    const observer = new MutationObserver(() => {
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      targets = document.querySelectorAll("button, a");
      targets.forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);
};