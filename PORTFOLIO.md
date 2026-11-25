# Joton Sutradhar — Portfolio

A scroll-driven journey through space — Earth, Mars, Jupiter, Saturn and finally a ray-traced black hole — rendered live in WebGL (three.js), with the portfolio content arriving at each stop.
Built with Next.js 16, Tailwind CSS v4, Motion and three.js. Live at https://jotonsd.github.io/jotonsd/

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (add -- -p 3100 if 3000 is busy)
```

## Edit content

Everything (bio, projects, integrations, skills, links) lives in `src/data/profile.ts`.
The 3D scene (planets, camera route, black hole shader) lives in `src/components/universe/`.

## Deploy to GitHub Pages

This repo deploys itself: `.github/workflows/deploy.yml` builds a static export on every push to `main`
and publishes it to GitHub Pages (one-time setup: **Settings → Pages → Source: GitHub Actions**).
