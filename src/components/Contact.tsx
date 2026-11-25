"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import { fromDepth } from "./reveal";
import { profile } from "@/data/profile";

function Magnetic({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 15 });
  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="group inline-flex items-center gap-3 rounded-full border border-gold/60 bg-gold/10 px-8 py-4 text-paper backdrop-blur-md transition-colors hover:bg-gold hover:text-black"
    >
      {children}
    </motion.a>
  );
}

/** The black hole sits at the centre — the message frames it, above and below. */
export function Contact() {
  const year = new Date().getFullYear();
  return (
    <section id="contact" className="relative flex min-h-[175vh] flex-col">
      <div className="legible mx-auto w-full max-w-4xl px-6 pt-36 text-center">
        <motion.div {...fromDepth()} className="label flex items-center justify-center gap-4 text-paper/60">
          <span className="text-gold">04</span>
          <span className="h-px w-10 bg-paper/30" />
          Arriving · <span className="text-paper">Sagittarius A*</span>
        </motion.div>
        <motion.h2 {...fromDepth(0.15)} className="mt-8 text-[clamp(2.6rem,6.5vw,5.6rem)] font-light leading-[1.04] tracking-[-0.035em]">
          Let&apos;s build something <span className="text-gold-grad">beyond the horizon.</span>
        </motion.h2>
        <motion.p {...fromDepth(0.3)} className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-paper/70">
          Freelance projects, full-time roles or a hard problem worth solving. Nothing escapes this inbox.
        </motion.p>
      </div>

      <div className="flex-1" />

      <div className="legible mx-auto w-full max-w-4xl px-6 pb-16 text-center">
        <motion.a
          {...fromDepth()}
          href={`mailto:${profile.email}`}
          className="inline-block border-b border-paper/25 pb-2 text-[clamp(1.3rem,3.6vw,2.6rem)] font-light tracking-tight transition-colors hover:border-gold hover:text-gold"
        >
          {profile.email}
        </motion.a>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          <Magnetic href={`mailto:${profile.email}`}>
            Start a conversation
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Magnetic>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-2 text-paper/60 hover:text-paper">
            <Github className="size-4" /> GitHub
          </a>
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-2 text-paper/60 hover:text-paper">
              <Linkedin className="size-4" /> LinkedIn
            </a>
          )}
        </div>
      </div>

      <footer className="border-t border-paper/10">
        <div className="label mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-paper/40 sm:flex-row md:px-10">
          <span>© {year} {profile.name}</span>
          <span>Crossed the event horizon · {year}</span>
        </div>
      </footer>
    </section>
  );
}
