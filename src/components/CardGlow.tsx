"use client";

import { useEffect } from "react";

/** Soft gold light that follows the pointer across glass cards (uses the normal system cursor). */
export function CardGlow() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.(".glass") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return null;
}
