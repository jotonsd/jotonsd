"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Lock } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { fromDepth } from "./reveal";
import { profile, projects } from "@/data/profile";

/** Jupiter sits on the right — projects stack on the left. */
export function Projects() {
  return (
    <section id="projects" className="relative py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="md:max-w-[680px]">
          <SectionHead
            index="02"
            planet="Jupiter"
            kicker="Selected work"
            title="Things I've built"
            accent="& shipped."
            intro="Products I designed and built end to end, from database schema to app store listing."
          />

          <div className="grid gap-6">
            {projects.map((p, i) => {
              const Wrapper = p.link ? motion.a : motion.article;
              const linkProps = p.link ? { href: p.link, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Wrapper
                  key={p.code}
                  {...linkProps}
                  {...fromDepth()}
                  className="glass group block rounded-2xl p-7 transition-colors duration-500 hover:border-gold/40"
                >
                  <div className="label flex items-center justify-between text-paper/45">
                    <span>
                      <span className="text-gold">{String(i + 1).padStart(2, "0")}</span>
                      <span className="mx-3 text-paper/25">/</span>
                      {p.kind}
                    </span>
                    {p.link ? (
                      <span className="flex items-center gap-1.5 text-paper/60 transition group-hover:text-gold">
                        Code <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Lock className="size-3" /> Private
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-[1.45rem] uppercase leading-tight">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-paper/70">{p.description}</p>

                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-paper/80">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <span className="h-px w-3 bg-gold/70" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 border-t border-paper/10 pt-4 font-mono text-[11px] tracking-wide text-paper/45">
                    {p.stack.join("  ·  ")}
                  </div>
                </Wrapper>
              );
            })}
          </div>

          <p className="label mt-10 text-paper/50">
            More on{" "}
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              github.com/jotonsd
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
