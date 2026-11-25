"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ATMO_FRAG, ATMO_VERT, PLANET_FRAG, PLANET_VERT, POST_FRAG, POST_VERT,
  RING_FRAG, RING_VERT, SKY_FRAG, SKY_VERT, STAR_FRAG, STAR_VERT,
} from "./shaders";

/* ------------------------------------------------------------------ */
/* The journey: one stop per page section, ending at a black hole.    */
/* ------------------------------------------------------------------ */

type Kind = "EARTH" | "MARS" | "JUPITER" | "SATURN";
type Stop = {
  name: string;
  section: string; // id of the page section this stop belongs to
  kind?: Kind;
  pos: THREE.Vector3;
  r: number;
  approach: number; // camera distance (along z) when the section is centred
  spin: number;
  atmo?: [number, number, number];
  atmoScale?: number;
};

const BH_SCALE = 2.5; // world units per Schwarzschild radius

export const STOPS: Stop[] = [
  { name: "Earth", section: "top", kind: "EARTH", pos: new THREE.Vector3(17, -5, 0), r: 11, approach: 30, spin: 0.012, atmo: [0.32, 0.58, 1.0], atmoScale: 1.045 },
  { name: "Mars", section: "work", kind: "MARS", pos: new THREE.Vector3(-14, 1.5, -700), r: 5.5, approach: 24, spin: 0.02, atmo: [0.85, 0.48, 0.3], atmoScale: 1.03 },
  { name: "Jupiter", section: "projects", kind: "JUPITER", pos: new THREE.Vector3(27, -4, -1400), r: 16, approach: 42, spin: 0.03, atmo: [0.8, 0.72, 0.6], atmoScale: 1.025 },
  { name: "Saturn", section: "stack", kind: "SATURN", pos: new THREE.Vector3(-22, -2, -2100), r: 8.5, approach: 38, spin: 0.025, atmo: [0.85, 0.78, 0.55], atmoScale: 1.03 },
  { name: "Sagittarius A*", section: "contact", pos: new THREE.Vector3(0, -3 * BH_SCALE, -2900), r: 0, approach: 60 * BH_SCALE, spin: 0 },
];

type Key = { p: number; z: number; stop: number; look: THREE.Vector3 };

function lookTarget(s: Stop) {
  if (!s.kind) return s.pos.clone();
  return new THREE.Vector3(s.pos.x * 0.22, s.pos.y * 0.22, s.pos.z - 90);
}

function computeKeys(): Key[] {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const vh = window.innerHeight;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const top = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, h: r.height };
  };
  const keys: Key[] = [];
  STOPS.forEach((s, i) => {
    const el = top(s.section);
    let p = 0;
    if (el) p = s.kind ? clamp((el.top + el.h / 2 - vh / 2) / max) : clamp((el.top - vh * 0.6) / max);
    if (i === 0) p = 0;
    keys.push({ p, z: s.pos.z + s.approach, stop: i, look: lookTarget(s) });
  });
  const bh = STOPS[STOPS.length - 1];
  keys.push({ p: 1, z: bh.pos.z + 9 * BH_SCALE, stop: STOPS.length - 1, look: bh.pos.clone() });
  for (let i = 1; i < keys.length; i++) keys[i].p = Math.max(keys[i].p, keys[i - 1].p + 0.001);
  return keys;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/* ------------------------------------------------------------------ */

function makeStars(count: number) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const G = new THREE.Vector3(0.35, 1, 0.25).normalize();
  const d = new THREE.Vector3();
  const palette = [
    [0.72, 0.8, 1.0], [1.0, 0.98, 0.96], [1.0, 0.92, 0.78], [1.0, 0.78, 0.58],
  ];
  for (let i = 0; i < count; i++) {
    d.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    if (Math.random() < 0.4) d.addScaledVector(G, -d.dot(G) * 0.88).normalize();
    pos.set([d.x * 900, d.y * 900, d.z * 900], i * 3);
    const mag = Math.pow(Math.random(), 7);
    size[i] = 1.1 + mag * 6;
    const t = Math.random();
    const c = palette[t < 0.12 ? 0 : t < 0.6 ? 1 : t < 0.86 ? 2 : 3];
    const b = 0.3 + mag * 1.6 + Math.random() * 0.25;
    color.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  return g;
}

function makeDust(count: number, zMin: number, zMax: number) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const color = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - 0.5) * 140, (Math.random() - 0.5) * 80, zMin + Math.random() * (zMax - zMin)], i * 3);
    size[i] = 0.8 + Math.random() * 1.4;
    const b = 0.12 + Math.random() * 0.2;
    color.set([b, b * 0.97, b * 0.92], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  return g;
}

type Hud = { index: number; dist: string; vel: string };

/** Fixed WebGL backdrop: a camera flight past planets to a black hole, driven by page scroll. */
export function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [hud, setHud] = useState<Hud>({ index: 0, dist: "—", vel: "—" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);

    const sun = new THREE.Vector3(0.55, 0.22, 0.8).normalize();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);

    // distant sky: Milky Way + stars, glued to the camera so they sit at infinity
    const far = new THREE.Group();
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(950, 48, 32),
      new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false }),
    );
    sky.renderOrder = -2;
    const starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      uniforms: { uDpr: { value: dpr }, uOpacity: { value: 1 } },
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    const stars = new THREE.Points(makeStars(9000), starMat);
    stars.renderOrder = -1;
    far.add(sky, stars);
    scene.add(far);

    // space dust along the route — near parallax gives the sense of speed
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      uniforms: { uDpr: { value: dpr }, uOpacity: { value: 1 } },
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    scene.add(new THREE.Points(makeDust(6000, STOPS[STOPS.length - 1].pos.z, 60), dustMat));

    // planets
    const spinners: { mesh: THREE.Mesh; speed: number }[] = [];
    const timeUniforms: { value: number }[] = [];
    for (const s of STOPS) {
      if (!s.kind) continue;
      const group = new THREE.Group();
      group.position.copy(s.pos);
      const uniforms = {
        uSun: { value: sun },
        uTime: { value: 0 },
        uAtmo: { value: new THREE.Vector3(...(s.atmo ?? [0, 0, 0])) },
        uCenter: { value: s.pos.clone() },
        uRingN: { value: new THREE.Vector3(0, 1, 0) },
        uRingIn: { value: s.r * 1.25 },
        uRingOut: { value: s.r * 2.3 },
      };
      timeUniforms.push(uniforms.uTime);
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(s.r, 160, 120),
        new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG, uniforms, defines: { [s.kind]: "" } }),
      );
      planet.rotation.z = 0.2;
      group.add(planet);
      spinners.push({ mesh: planet, speed: s.spin });

      if (s.atmo) {
        const k = s.atmoScale ?? 1.04;
        const atmo = new THREE.Mesh(
          new THREE.SphereGeometry(s.r * k, 96, 64),
          new THREE.ShaderMaterial({
            vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
            uniforms: { uColor: { value: new THREE.Vector3(...s.atmo) }, uSun: { value: sun }, uThickness: { value: Math.sqrt(1 - 1 / (k * k)) } },
            side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
          }),
        );
        group.add(atmo);
      }

      if (s.kind === "SATURN") {
        group.rotation.set(0.38, 0, 0.32);
        group.updateMatrixWorld();
        const n = new THREE.Vector3(0, 1, 0).applyQuaternion(group.quaternion).normalize();
        uniforms.uRingN.value = n;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(s.r * 1.25, s.r * 2.3, 512, 1),
          new THREE.ShaderMaterial({
            vertexShader: RING_VERT, fragmentShader: RING_FRAG,
            uniforms: {
              uInner: { value: s.r * 1.25 }, uOuter: { value: s.r * 2.3 }, uSun: { value: sun },
              uCenter: { value: s.pos.clone() }, uR: { value: s.r }, uRingN: { value: n },
            },
            side: THREE.DoubleSide, transparent: true, depthWrite: false,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);
      }
      scene.add(group);
    }

    // post pass with the black hole
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true });
    const bh = STOPS[STOPS.length - 1];
    const bhRot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.06, 0, 0.1));
    const bhRotInv = new THREE.Matrix3().setFromMatrix4(bhRot);
    const bhRotM = bhRotInv.clone().transpose();
    const postMat = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG,
      uniforms: {
        tScene: { value: rt.texture },
        uInvProj: { value: camera.projectionMatrixInverse },
        uCamWorld: { value: camera.matrixWorld },
        uViewProj: { value: new THREE.Matrix4() },
        uCamPos: { value: camera.position },
        uBH: { value: bh.pos },
        uBHScale: { value: BH_SCALE },
        uBHOn: { value: 0 },
        uBHRot: { value: bhRotM },
        uBHRotInv: { value: bhRotInv },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
      depthTest: false, depthWrite: false,
    });
    const post = new THREE.Scene();
    post.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // sizing + journey keys
    let keys = computeKeys();
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      rt.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
      camera.aspect = w / h;
      camera.fov = w < 768 ? 62 : 50;
      camera.updateProjectionMatrix();
      postMat.uniforms.uRes.value.set(w * dpr, h * dpr);
      keys = computeKeys();
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(() => (keys = computeKeys()));
    ro.observe(document.body);

    const scrollFrac = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    let ps = scrollFrac();
    let time = 0;
    let lastZ = 0;
    let hudT = 0;
    let raf = 0;
    let last = performance.now();
    const look = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      const target = scrollFrac();
      ps = reduce ? target : ps + (target - ps) * (1 - Math.exp(-dt * 3));

      // where on the route are we?
      let i = 0;
      while (i < keys.length - 2 && ps > keys[i + 1].p) i++;
      const k0 = keys[i], k1 = keys[i + 1];
      const e = smooth(Math.min(1, Math.max(0, (ps - k0.p) / (k1.p - k0.p))));
      const z = THREE.MathUtils.lerp(k0.z, k1.z, e);
      camera.position.set(Math.sin(time * 0.07) * 0.6, Math.sin(time * 0.05) * 0.35, z);
      look.lerpVectors(k0.look, k1.look, e);

      const vz = (lastZ - z) / Math.max(dt, 1e-4);
      lastZ = z;
      camera.up.set(THREE.MathUtils.clamp(vz * 0.0004, -0.06, 0.06), 1, 0).normalize();
      camera.lookAt(look);
      camera.updateMatrixWorld();
      far.position.copy(camera.position);

      for (const s of spinners) s.mesh.rotation.y += s.speed * dt * (reduce ? 0 : 1);
      for (const u of timeUniforms) u.value = time;

      const bhDist = camera.position.distanceTo(bh.pos);
      postMat.uniforms.uBHOn.value = 1 - THREE.MathUtils.smoothstep(bhDist, 260, 420);
      postMat.uniforms.uTime.value = time;
      postMat.uniforms.uViewProj.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(post, postCam);

      hudT += dt;
      if (hudT > 0.25) {
        hudT = 0;
        const nearest = keys.reduce((a, k) => (Math.abs(k.p - ps) < Math.abs(a.p - ps) ? k : a), keys[0]);
        const s = STOPS[nearest.stop];
        const d = tmp.copy(s.pos).sub(camera.position).length();
        setHud({
          index: nearest.stop,
          dist: `${Math.round(d * 4200).toLocaleString("en-US")} km`,
          vel: `${(11.2 + Math.abs(vz) * 38).toLocaleString("en-US", { maximumFractionDigits: 1 })} km/s`,
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      postMat.dispose();
      rt.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full bg-black" />
      {failed && <div aria-hidden className="fixed inset-0 -z-10 bg-[#04050d]" />}
      {/* trajectory rail */}
      <nav aria-label="Journey" className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
        <ol className="relative flex flex-col gap-7 border-l border-paper/15 pl-4">
          {STOPS.map((s, i) => (
            <li key={s.name}>
              <a href={`#${s.section}`} className="group flex items-center gap-3">
                <span
                  className={`absolute -left-[3.5px] size-[7px] rounded-full transition-all duration-500 ${
                    hud.index === i ? "bg-gold shadow-[0_0_10px_2px_rgba(233,198,127,0.6)]" : "bg-paper/30"
                  }`}
                />
                <span className="label pointer-events-none whitespace-nowrap rounded bg-black/70 px-2 py-1 text-paper/80 opacity-0 transition-opacity group-hover:opacity-100">
                  {s.name}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* telemetry */}
      <div aria-hidden className="label pointer-events-none fixed right-6 top-20 z-30 hidden text-right leading-loose text-paper/45 md:block md:right-10">
        <div className="text-gold">
          {STOPS[hud.index].kind ? "Approaching" : "Event horizon"} · <span className="text-paper">{STOPS[hud.index].name}</span>
        </div>
        <div>
          Dist <span className="text-paper/80">{hud.dist}</span>
        </div>
        <div>
          Vel <span className="text-paper/80">{hud.vel}</span>
        </div>
      </div>
    </>
  );
}
