"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";

const IntroCtx = createContext(true);
/** true once loading + the launch sequence have finished (or were skipped). */
export const useIntroDone = () => useContext(IntroCtx);

declare global {
  interface Window {
    __introDone?: boolean;
    __sceneReady?: boolean;
  }
}

const ease = [0.22, 1, 0.36, 1] as const;
const MAX_WAIT = 15000; // never hold visitors longer than this

/* Real loading checks: page assets, fonts, and the first rendered 3D frame. */
const TASKS = [
  { id: "page", label: "Loading mission data", weight: 0.25 },
  { id: "fonts", label: "Calibrating instruments", weight: 0.2 },
  { id: "scene", label: "Rendering planets & black hole", weight: 0.55 },
] as const;
type TaskId = (typeof TASKS)[number]["id"];

function useLoading() {
  const [done, setDone] = useState<Record<TaskId, boolean>>({ page: false, fonts: false, scene: false });

  useEffect(() => {
    const mark = (id: TaskId) => setDone((d) => (d[id] ? d : { ...d, [id]: true }));

    if (document.readyState === "complete") mark("page");
    else window.addEventListener("load", () => mark("page"), { once: true });

    document.fonts?.ready.then(() => mark("fonts")).catch(() => mark("fonts"));
    if (!document.fonts) mark("fonts");

    if (window.__sceneReady) mark("scene");
    const onScene = () => mark("scene");
    window.addEventListener("scene:ready", onScene);

    const failsafe = setTimeout(() => setDone({ page: true, fonts: true, scene: true }), MAX_WAIT);
    return () => {
      window.removeEventListener("scene:ready", onScene);
      clearTimeout(failsafe);
    };
  }, []);

  const progress = TASKS.reduce((sum, t) => sum + (done[t.id] ? t.weight : 0), 0);
  const current = TASKS.find((t) => !done[t.id]);
  return { progress, label: current?.label ?? "All systems go", complete: progress >= 0.999 };
}

function Launch({ onDone, reduce }: { onDone: () => void; reduce: boolean }) {
  const done = useRef(onDone);
  done.current = onDone;
  const { progress, label, complete } = useLoading();
  const [step, setStep] = useState<string | null>(null);

  // smoothly animated percentage, creeping forward while a task is in flight
  const shown = useMotionValue(0);
  const pct = useTransform(shown, (v) => `${Math.round(v * 100)}`.padStart(2, "0"));
  useEffect(() => {
    const target = complete ? 1 : Math.min(0.97, progress + 0.12);
    const c = animate(shown, target, { duration: complete ? 0.6 : 2.4, ease: "easeOut" });
    return () => c.stop();
  }, [progress, complete, shown]);

  // once everything is loaded: countdown → ignition → lift-off
  useEffect(() => {
    if (!complete) return;
    if (reduce) {
      const t = setTimeout(() => done.current(), 300);
      return () => clearTimeout(t);
    }
    const t = [
      setTimeout(() => setStep("3"), 700),
      setTimeout(() => setStep("2"), 1300),
      setTimeout(() => setStep("1"), 1900),
      setTimeout(() => setStep("Ignition"), 2500),
      setTimeout(() => done.current(), 3300),
    ];
    return () => t.forEach(clearTimeout);
  }, [complete, reduce]);

  return (
    <motion.div
      key="launch"
      exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease }}
      onClick={() => complete && done.current()}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black ${complete ? "cursor-pointer" : "cursor-progress"}`}
    >
      <motion.div
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, letterSpacing: "0.3em" }}
        transition={{ duration: 1.2, ease }}
        className="label text-paper/50"
      >
        Mission JS-2026 · {step ? "Launch sequence" : "Pre-flight"}
      </motion.div>

      <div className="relative mt-10 flex h-28 items-center justify-center">
        <AnimatePresence mode="popLayout">
          {step ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease }}
              className={`font-display uppercase ${step === "Ignition" ? "text-[clamp(1.6rem,5vw,3.2rem)] text-gold" : "text-[clamp(4rem,12vw,7rem)] text-paper"}`}
            >
              {step}
            </motion.div>
          ) : (
            <motion.div
              key="pct"
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease }}
              className="flex items-start font-display text-[clamp(4rem,12vw,7rem)] tabular-nums text-paper"
            >
              <motion.span>{pct}</motion.span>
              <span className="ml-2 mt-2 font-sans text-[0.32em] font-light text-gold">%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 h-px w-[min(320px,70vw)] overflow-hidden bg-paper/10">
        <motion.div className="h-full origin-left bg-gold" style={{ scaleX: shown }} />
      </div>

      <div className="label mt-5 h-4 text-paper/40">
        <AnimatePresence mode="wait">
          <motion.span
            key={step ? "go" : label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={step ? "text-gold/80" : ""}
          >
            {step ? "All systems go" : label}
          </motion.span>
        </AnimatePresence>
      </div>

      {complete && <div className="label absolute bottom-10 text-paper/30">Click to skip</div>}
    </motion.div>
  );
}

/** Covers the page from the first paint until everything is loaded, then runs the launch countdown. */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // keep the page at the top while the loading screen is up
  useEffect(() => {
    if (!show) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [show]);

  const finish = useCallback(() => {
    setShow(false);
    setDone(true);
    window.__introDone = true;
    window.dispatchEvent(new Event("intro:done"));
  }, []);

  return (
    <IntroCtx.Provider value={done}>
      {children}
      <AnimatePresence>{show && <Launch onDone={finish} reduce={reduce} />}</AnimatePresence>
    </IntroCtx.Provider>
  );
}
