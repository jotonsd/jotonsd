// Shared "arrives out of deep space" reveal used by every card.
export const fromDepth = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" },
  whileInView: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as const },
});
