"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile, stats } from "@/data/profile";
import { useIntroDone } from "./intro";

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

function Letters({ text, className, delay }: { text: string; className?: string; delay: number }) {
  const go = useIntroDone();
  return (
    <span className={`block ${className ?? ""}`} aria-label={text}>
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: "0.35em", filter: "blur(12px)" }}
          animate={go && { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: delay + i * 0.045, ease }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const go = useIntroDone();
  return (
    <section id="top" className="relative flex min-h-screen items-center pb-24 pt-32">
      <div className="legible mx-auto w-full max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={go && { opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="label mb-10 flex items-center gap-4 text-paper/60"
        >
          <span className="size-1.5 rounded-full bg-gold shadow-[0_0_12px_2px] shadow-gold/60" />
          Departing Earth
          <span className="h-px w-10 bg-paper/30" />
          <span className="text-paper/40">{profile.role}</span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.3rem,7.4vw,6.8rem)] uppercase leading-[1.02] tracking-[-0.02em]">
          <Letters text={profile.first.charAt(0) + profile.first.slice(1).toLowerCase()} delay={0.3} />
          <Letters text={profile.last.charAt(0) + profile.last.slice(1).toLowerCase()} delay={0.55} className="text-gold" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={go && { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.2, ease }}
          className="mt-10 max-w-xl text-lg leading-relaxed text-paper/75 md:text-xl"
        >
          {profile.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={go && { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.4, ease }}
          className="mt-10 flex flex-wrap items-center gap-8"
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-3 rounded-full border border-gold/50 bg-gold/10 px-7 py-3.5 text-sm tracking-wide text-paper backdrop-blur-md transition hover:border-gold hover:bg-gold/20"
          >
            Begin the journey
            <ArrowDown className="size-4 text-gold transition group-hover:translate-y-0.5" />
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-2 text-paper/70 transition hover:text-paper">
            GitHub <ArrowUpRight className="size-3.5" />
          </a>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={go && { opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.7 }}
          className="mt-24 grid max-w-4xl grid-cols-2 gap-y-8 border-t border-paper/15 pt-8 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse justify-end pr-6">
              <dt className="mt-2 font-mono text-[11px] leading-snug tracking-wider text-paper/50">{s.label}</dt>
              <dd className="font-display text-3xl text-paper">
                <Counter to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={go && { opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="label absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-paper/40 [@media(max-height:960px)]:hidden"
      >
        Scroll to travel
        <span className="relative h-10 w-px overflow-hidden bg-paper/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gold"
            animate={{ y: ["-100%", "250%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
