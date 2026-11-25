// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: "Joton Sutradhar",
  first: "JOTON",
  last: "SUTRADHAR",
  role: "Full-Stack Developer",
  email: "jotonsutradharjoy@gmail.com",
  github: "https://github.com/jotonsd",
  linkedin: "https://bd.linkedin.com/in/joton-sutradhar-b77996196/",
  intro:
    "I build airline booking engines wired into GDS & NDC, run e-commerce and accounting platforms in production, and ship AI-powered products — across Django, Laravel, Next.js and Flutter.",
};

export const stats = [
  { value: 8, suffix: "+", label: "Airline & GDS integrations" },
  { value: 6, suffix: "", label: "Products built end-to-end" },
  { value: 4, suffix: "", label: "Platforms — web, API, mobile, voice" },
  { value: 2, suffix: "", label: "Languages shipped — EN / বাংলা" },
];

// Route map — positions are in a 1000 × 520 SVG viewBox, hub at (500, 260)
export const routes = [
  { code: "1G", name: "Travelport", note: "GDS + NDC", x: 150, y: 90 },
  { code: "1B", name: "Sabre", note: "GDS + NDC", x: 90, y: 275 },
  { code: "EK", name: "Emirates", note: "Direct", x: 420, y: 480 },
  { code: "WY", name: "Oman Air", note: "Direct", x: 640, y: 470 },
  { code: "G9", name: "Air Arabia", note: "Direct", x: 840, y: 420 },
  { code: "ET", name: "Ethiopian", note: "Direct", x: 915, y: 245 },
  { code: "2A", name: "Air Astra", note: "Direct", x: 820, y: 80 },
  { code: "6E", name: "IndiGo", note: "Direct", x: 700, y: 60 },
  { code: "PG", name: "Payments", note: "Gateway", x: 500, y: 40 },
];

export const work = {
  org: "FlyGhuri / FG Group",
  title: "Full-Stack Developer — Flight Booking Platforms",
  summary:
    "I build and maintain the systems behind flight search, fare pricing, booking and ticketing: the B2C storefront, the B2B agency portal, admin tooling and the integration services that talk to GDSs and airlines directly.",
  logs: [
    {
      title: "Group Ticketing Portal",
      body: "Laravel 12 + Inertia + Vue 3 monolith with partner APIs for search, book, ticket and retrieve, plus inventory and stock management.",
    },
    {
      title: "B2C & B2B Platforms",
      body: "Full stack, end to end: Next.js frontends and Django REST backends for flight search, booking, role-based permissions, ledger reports, support tickets and real-time chat (Channels + Celery + Redis).",
    },
    {
      title: "Supporting Services",
      body: "Payment gateway, print service, travel insurance (Bimafy) and load testing for high-traffic flight search.",
    },
  ],
};

export type Project = {
  code: string;
  name: string;
  kind: string;
  dest: string;
  seat: string;
  gate: string;
  description: string;
  highlights: string[];
  stack: string[];
  link?: string; // source code
  live?: string; // live site
};

export const projects: Project[] = [
  {
    code: "PFX",
    name: "Portfolix",
    kind: "AI · SaaS",
    dest: "CAREERS",
    seat: "1A",
    gate: "B4",
    description:
      "AI career platform: build CVs, generate portfolio sites and score resumes against ATS filters. LLM work runs async through Celery queues.",
    highlights: ["CV builder + PDF export", "ATS resume analysis", "Billing & admin dashboard"],
    stack: ["Django 6", "DRF", "Celery", "Redis", "PostgreSQL", "Claude", "Gemini", "Next.js"],
  },
  {
    code: "PJG",
    name: "PujariGhar",
    kind: "E-commerce",
    dest: "STOREFRONT",
    seat: "2C",
    gate: "C2",
    description:
      "Storefront for puja essentials with a complete back office: web, mobile and delivery apps, plus an admin with real double-entry accounting.",
    highlights: ["Bangla / English (next-intl)", "Ledger, trial balance, stock reports", "Courier integration & blog"],
    stack: ["Next.js 14", "TypeScript", "Tailwind", "RTK Query", "Django"],
    live: "https://pujarighar.com",
  },
  {
    code: "SRP",
    name: "Serpely",
    kind: "SaaS · SEO",
    dest: "RANKINGS",
    seat: "3F",
    gate: "A6",
    description:
      "SEO tools suite with subscription plans, orders and plan history, backed by a carefully documented relational schema.",
    highlights: ["Plans, orders & billing history", "Analytics dashboards", "OAuth login flow"],
    stack: ["Laravel", "Next.js", "Redux Persist", "Recharts"],
    live: "https://serpely.com",
  },
  {
    code: "TKK",
    name: "Tikki",
    kind: "Mobile · Android",
    dest: "HABITS",
    seat: "4B",
    gate: "D7",
    description:
      "Plan it. Tick it. Repeat it. Offline-first routine tracker with on-time reminders, streaks and a GitHub-style activity graph.",
    highlights: ["Offline-first", "Streaks & calendar", "Activity heatmap"],
    stack: ["Flutter", "Dart"],
    link: "https://github.com/jotonsd/tikki",
    live: "https://jotonsd.github.io/tikki-privacy/home.html",
  },
  {
    code: "KTU",
    name: "Kutu",
    kind: "AI · Voice",
    dest: "DESKTOP",
    seat: "5D",
    gate: "B9",
    description:
      "Push-to-talk desk companion: mic → Whisper → Claude/Gemini → Piper TTS, with face and servo output ready for future hardware.",
    highlights: ["Speech-to-text", "LLM reasoning", "Text-to-speech"],
    stack: ["Python", "faster-whisper", "Piper", "LLMs"],
    link: "https://github.com/jotonsd/robo-kutu",
  },
  {
    code: "KSL",
    name: "Kashleaf",
    kind: "Finance",
    dest: "LEDGERS",
    seat: "6E",
    gate: "C8",
    description:
      "Personal & business accounting: income, expenses, loans and bills in one private place. Django API, Next.js web app and a Flutter mobile app.",
    highlights: ["Income & expense tracking", "Loans & bills", "Web + mobile"],
    stack: ["Django", "Next.js", "TypeScript", "Flutter"],
    link: "https://github.com/jotonsd/hisab-frontend",
    live: "https://hisab.flyghuri.com",
  },
];

export const stack = [
  { title: "Frontend", color: "text-stamp-blue", rotate: -6, items: ["Next.js / React", "TypeScript", "Vue 3 + Inertia", "Tailwind CSS", "Redux · Zustand", "TanStack Query"] },
  { title: "Backend", color: "text-stamp-red", rotate: 4, items: ["Python · Django · DRF", "PHP · Laravel 12", "Celery · RabbitMQ", "REST API design", "JWT / OAuth"] },
  { title: "Data & Infra", color: "text-stamp-green", rotate: -3, items: ["PostgreSQL", "Redis", "Gunicorn · Nginx", "Load testing", "Postman"] },
  { title: "Mobile", color: "text-stamp-violet", rotate: 7, items: ["Flutter", "Dart", "Offline-first", "Android"] },
  { title: "AI", color: "text-stamp-red", rotate: -8, items: ["Claude API", "Google Gemini", "Whisper STT", "Piper TTS"] },
  { title: "Travel APIs", color: "text-stamp-blue", rotate: 5, items: ["Travelport GDS & NDC", "Sabre GDS & NDC", "Airline direct", "Payment gateways"] },
];

