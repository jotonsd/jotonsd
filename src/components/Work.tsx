"use client";

import { motion } from "motion/react";
import { SectionHead } from "./SectionHead";
import { fromDepth } from "./reveal";
import { routes, work } from "@/data/profile";

/** Mars sits on the left — content flies in on the right. */
export function Work() {
  return (
    <section id="work" className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="md:ml-auto md:max-w-[640px]">
          <SectionHead
            index="01"
            planet="Mars"
            kicker="Travel systems"
            title="Travel tech, at"
            accent="airline scale."
            intro={work.summary}
          />

          <motion.div {...fromDepth()} className="glass rounded-2xl">
            <div className="label flex items-center justify-between border-b border-paper/10 px-6 py-4 text-paper/50">
              <span>Integrations</span>
              <span className="text-paper/35">{work.org}</span>
            </div>
            <ul className="grid sm:grid-cols-2">
              {routes.map((r, i) => (
                <li
                  key={r.code}
                  className={`flex items-baseline gap-4 border-paper/10 px-6 py-3.5 ${i < routes.length - (routes.length % 2 || 2) ? "border-b" : ""} ${i % 2 === 0 ? "sm:border-r" : ""}`}
                >
                  <span className="w-9 font-mono text-xs text-gold">{r.code}</span>
                  <span className="text-[15px] text-paper">{r.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-paper/40">{r.note}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="mt-6 grid gap-6">
            {work.logs.map((log, i) => (
              <motion.div key={log.title} {...fromDepth(0.1 + i * 0.12)} className="glass rounded-2xl p-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-gold">0{i + 1}</span>
                  <h3 className="text-xl font-normal">{log.title}</h3>
                </div>
                <p className="mt-2 pl-8 text-[15px] leading-relaxed text-paper/65">{log.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
