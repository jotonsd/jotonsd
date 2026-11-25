"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";

/** Scroll progress drawn as a flight path with a plane flying across the top of the page. */
export function ScrollPlane() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const left = useTransform(progress, (v) => `calc(${v * 100}% - ${v * 22}px)`);

  return (
    <div data-scrollbar className="pointer-events-none fixed inset-x-0 top-0 z-50 h-5">
      <div className="absolute inset-x-0 top-[9px] border-t border-dashed border-white/10" />
      <motion.div
        className="absolute left-0 top-[9px] h-px origin-left bg-gold/70"
        style={{ scaleX: progress, width: "100%" }}
      />
      <motion.div className="absolute top-[1px]" style={{ left }}>
        <span className="mt-[5px] block size-2 rounded-full bg-gold shadow-[0_0_10px_3px_rgba(233,198,127,0.55)]" />
      </motion.div>
    </div>
  );
}
