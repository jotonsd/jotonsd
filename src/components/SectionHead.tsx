"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { openVisit } from "./universe/visit";

type Props = {
  index: string;
  planet: string;
  kicker: string;
  title: string;
  accent: string;
  intro?: string;
};

/** Section heading: arrival marker, light headline with a gold accent. */
export function SectionHead({ index, planet, kicker, title, accent, intro }: Props) {
  const words = title.split(" ");
  return (
    <div className="legible mb-12">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="label mb-6 flex items-center gap-4 text-paper/60"
      >
        <span className="text-gold">{index}</span>
        <span className="h-px w-10 bg-paper/30" />
        <span>
          Arriving · <span className="text-paper">{planet}</span>
        </span>
        <span className="hidden text-paper/40 sm:inline">— {kicker}</span>
        <button
          type="button"
          onClick={() => openVisit(planet)}
          className="label ml-1 inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-gold transition hover:border-gold hover:bg-gold/10"
        >
          Visit <ArrowUpRight className="size-3" />
        </button>
      </motion.div>

      <motion.h2
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-80px" }}
        className="font-display text-[clamp(1.6rem,3.3vw,2.8rem)] uppercase leading-[1.2] tracking-[-0.01em]"
      >
        {words.map((w, i) => (
          <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, shown: { y: 0 } }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
          </span>
        ))}
        <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block text-gold-grad"
            variants={{ hidden: { y: "110%" }, shown: { y: 0 } }}
            transition={{ duration: 0.9, delay: words.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {accent}
          </motion.span>
        </span>
      </motion.h2>

      {intro && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/70"
        >
          {intro}
        </motion.p>
      )}
    </div>
  );
}
