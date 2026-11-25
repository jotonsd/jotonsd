// Lightweight bridge so any component can open a planet visit without importing three.js.
export const openVisit = (name: string) => window.dispatchEvent(new CustomEvent("visit:open", { detail: name }));

export type PlanetInfo = { tagline: string; section: string; facts: [string, string][] };

// Real figures (NASA / Event Horizon Telescope).
export const PLANET_INFO: Record<string, PlanetInfo> = {
  Earth: {
    tagline: "Home port. The pale blue dot where every mission begins.",
    section: "Departure · Introduction",
    facts: [["Diameter", "12,742 km"], ["From the Sun", "149.6M km"], ["Day length", "23h 56m"], ["Moons", "1"]],
  },
  Mars: {
    tagline: "The red planet: cold, dusty, and home to Olympus Mons, the tallest volcano in the solar system.",
    section: "Gate 01 · Travel systems",
    facts: [["Diameter", "6,779 km"], ["From the Sun", "227.9M km"], ["Day length", "24h 37m"], ["Moons", "2"]],
  },
  Jupiter: {
    tagline: "A gas giant that could hold 1,300 Earths, with a storm wider than our planet that has raged for centuries.",
    section: "Gate 02 · Selected work",
    facts: [["Diameter", "139,820 km"], ["From the Sun", "778.5M km"], ["Day length", "9h 56m"], ["Moons", "95+"]],
  },
  Saturn: {
    tagline: "Its rings stretch 280,000 km across, yet in places are only about 10 metres thick.",
    section: "Gate 03 · Stack",
    facts: [["Diameter", "116,460 km"], ["From the Sun", "1.43B km"], ["Day length", "10h 33m"], ["Moons", "274"]],
  },
  "Sagittarius A*": {
    tagline: "The supermassive black hole at the heart of the Milky Way. Not even light escapes past its event horizon.",
    section: "Gate 04 · Contact",
    facts: [["Mass", "4.3M Suns"], ["Distance", "26,700 ly"], ["Event horizon", "~12.7M km"], ["First imaged", "2022"]],
  },
};
