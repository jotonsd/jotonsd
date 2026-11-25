"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const links = [
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time || "--:--"}</span>;
}

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-black/70 to-transparent"
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full border border-gold/50 text-[11px] font-medium tracking-wider text-gold">JS</span>
          <span className="hidden text-sm font-medium tracking-tight text-paper/80 sm:inline">Joton Sutradhar</span>
        </a>
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="label text-paper/60 transition-colors hover:text-paper">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="label text-paper/45">
          Local <Clock />
        </span>
      </nav>
    </motion.header>
  );
}
