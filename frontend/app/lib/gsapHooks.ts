"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Animate a counter element from 0 to target value using GSAP
 */
export function animateCounter(
  element: HTMLElement | null,
  targetValue: number,
  duration = 2,
  prefix = "",
  suffix = ""
) {
  if (!element) return;

  const obj = { val: 0 };
  gsap.to(obj, {
    val: targetValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      if (element) {
        element.textContent = `${prefix}${Math.floor(obj.val).toLocaleString()}${suffix}`;
      }
    },
  });
}

/**
 * Hook to apply floating animation to an element (ambient bobbing)
 */
export function useFloatingAnimation(deltaY = 12, duration = 3.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: -deltaY,
        duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, ref);

    return () => ctx.revert();
  }, [deltaY, duration]);

  return ref;
}

/**
 * Hook for subtle magnetic cursor tracking on buttons
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}

/**
 * Animate modal entrance with spring scale
 */
export function animateModalOpen(modalElement: HTMLElement | null, backdropElement: HTMLElement | null) {
  if (!modalElement) return;

  if (backdropElement) {
    gsap.fromTo(
      backdropElement,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
  }

  gsap.fromTo(
    modalElement,
    { scale: 0.9, opacity: 0, y: 20 },
    { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" }
  );
}

/**
 * Animate modal exit
 */
export function animateModalClose(
  modalElement: HTMLElement | null,
  backdropElement: HTMLElement | null,
  onComplete: () => void
) {
  if (!modalElement) {
    onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });

  if (backdropElement) {
    tl.to(backdropElement, { opacity: 0, duration: 0.2, ease: "power2.in" }, 0);
  }

  tl.to(
    modalElement,
    { scale: 0.92, opacity: 0, y: 15, duration: 0.2, ease: "power2.in" },
    0
  );
}
