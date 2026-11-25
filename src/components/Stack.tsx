"use client";

import { motion } from "motion/react";
import { SectionHead } from "./SectionHead";
import { fromDepth } from "./reveal";
import { stack } from "@/data/profile";

/** Saturn sits on the left — the toolkit appears on the right. */
export function Stack() {
  return (
    <section id="stack" className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="md:ml-auto md:max-w-[640px]">
          <SectionHead
            index="03"
            planet="Saturn"
            kicker="Instruments"
            title="The stack I"
            accent="fly with."
            intro="I choose by the job: Django for data-heavy APIs, Laravel for fast monoliths, Next.js for anything users touch."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {stack.map((g, i) => (
              <motion.div key={g.title} {...fromDepth(i * 0.08)} className="glass rounded-2xl p-6">
                <h3 className="label text-gold">{g.title}</h3>
                <ul className="mt-4 grid gap-1.5 text-[15px] text-paper/80">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
