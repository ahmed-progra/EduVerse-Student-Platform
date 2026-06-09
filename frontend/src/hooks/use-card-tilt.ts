"use client";
import { useEffect } from "react";

type TiltOptions = {
  maxTilt?: number;
  perspective?: number;
  glare?: boolean;
  glareMax?: number;
  scale?: number;
  speed?: number;
  reset?: boolean;
};

function initTilt(selector: string, options: TiltOptions = {}) {
  const {
    maxTilt = 12,
    perspective = 1000,
    glare = true,
    glareMax = 0.25,
    scale = 1.04,
    speed = 400,
    reset = true,
  } = options;

  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!els.length) return;

  els.forEach((el) => {
    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03,0.98,0.52,0.99), box-shadow ${speed}ms cubic-bezier(0.03,0.98,0.52,0.99)`;

    // Ensure parallax var exists and always contributes
    el.style.setProperty("--parallax-y", el.style.getPropertyValue("--parallax-y") || "0px");

    if (glare) {
      const glareEl = document.createElement("div");
      glareEl.className = "tilt-glare";
      glareEl.style.cssText = `
        position: absolute; inset: 0; border-radius: inherit;
        pointer-events: none; overflow: hidden; z-index: 1;
      `;

      const glareInner = document.createElement("div");
      glareInner.className = "tilt-glare-inner";
      glareInner.style.cssText = `
        position: absolute;
        width: 200%; height: 200%;
        top: -50%; left: -50%;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,${glareMax}) 0%,
          rgba(255,255,255,0) 60%
        );
        transform: rotate(0deg);
        pointer-events: none;
        transition: transform ${speed}ms ease, opacity ${speed}ms ease;
        opacity: 0;
      `;

      glareEl.appendChild(glareInner);
      // Needed for absolute overlay
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.appendChild(glareEl);
    }

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotateX = -dy * maxTilt;
      const rotateY = dx * maxTilt;

      el.style.transform = `
        translateY(var(--parallax-y))
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${scale},${scale},${scale})
      `;

      const shadowX = rotateY * 0.8;
      const shadowY = -rotateX * 0.8;
      el.style.boxShadow = `
        ${shadowX}px ${shadowY}px 30px rgba(124,58,237,0.18),
        0 20px 60px rgba(124,58,237,0.12)
      `;

      if (glare) {
        const glareI = el.querySelector<HTMLElement>(".tilt-glare-inner");
        if (glareI) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          glareI.style.transform = `rotate(${angle}deg)`;
          glareI.style.opacity = "1";
        }
      }
    };

    const onLeave = () => {
      if (reset) {
        el.style.transform = `translateY(var(--parallax-y)) perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
        el.style.boxShadow = "";
      }
      if (glare) {
        const glareI = el.querySelector<HTMLElement>(".tilt-glare-inner");
        if (glareI) glareI.style.opacity = "0";
      }
    };

    // Prevent mobile transform jank
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    // Initialize transform so parallax stacking works immediately
    if (reset) {
      el.style.transform = `translateY(var(--parallax-y)) perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    }

    // Cleanup via returning handlers
    (initTilt as any)._cleanup?.push(() => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    });
  });
}

export function useCardTilt() {
  useEffect(() => {
    const shouldDisableTilt = window.matchMedia("(hover: none)").matches;
    if (shouldDisableTilt) return;

    const cleanup: Array<() => void> = [];
    (initTilt as any)._cleanup = cleanup;

    // Parallax (subtle): set CSS var so tilt transform can include translateY(var(--parallax-y))
    const parallaxMap: Array<{ selector: string; speed: number }> = [
      { selector: ".hero-badge", speed: 0.08 },
      { selector: ".hero-title", speed: 0.05 },
      { selector: ".hero-cta", speed: 0.04 },
      { selector: ".feature-card", speed: 0.06 },
      { selector: ".integration-pill", speed: 0.10 },
      { selector: ".dashboard-preview", speed: 0.07 },
    ];

    const onScroll = () => {
      const scrollY = window.scrollY || 0;
      parallaxMap.forEach(({ selector, speed }) => {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          el.style.setProperty("--parallax-y", `${scrollY * speed}px`);
        });
      });
      // Also support current landing pills class without markup changes
      document.querySelectorAll<HTMLElement>(".pill-tag").forEach((el) => {
        el.style.setProperty("--parallax-y", `${(scrollY || 0) * 0.10}px`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanup.push(() => window.removeEventListener("scroll", onScroll));

    // Tilt selectors (as requested)
    initTilt(".feature-card", { maxTilt: 12, scale: 1.04, glare: true, glareMax: 0.2 });
    initTilt(".skill-node", { maxTilt: 18, scale: 1.06, glare: false, perspective: 800 });
    initTilt(".dashboard-preview", { maxTilt: 8, scale: 1.02, glare: true, glareMax: 0.3 });
    initTilt(".btn-primary", { maxTilt: 10, scale: 1.05, glare: true, glareMax: 0.15 });
    initTilt(".integration-pill, .pill-tag", { maxTilt: 15, scale: 1.05, glare: false });

    return () => {
      cleanup.forEach((fn) => fn());
      (initTilt as any)._cleanup = undefined;
    };
  }, []);
}

