"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { PLANET_INFO } from "./visit";
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

/** Tells the loading screen the first frame (all shaders compiled) has been drawn. */
function markSceneReady() {
  window.__sceneReady = true;
  window.dispatchEvent(new Event("scene:ready"));
}

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
  const [visit, setVisit] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const hoverLabel = useRef<HTMLDivElement>(null);
  const actions = useRef({ open: (_i: number) => {}, close: () => {}, step: (_d: number) => {} });

  // while visiting: hide the page content and lock scrolling
  useEffect(() => {
    const html = document.documentElement;
    if (visit === null) {
      delete html.dataset.visiting;
      return;
    }
    html.dataset.visiting = "1";
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [visit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      markSceneReady();
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
    const pickables: THREE.Mesh[] = [];
    const pickIndex = new Map<THREE.Object3D, number>();
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
      pickables.push(planet);
      pickIndex.set(planet, STOPS.indexOf(s));

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

    // lift-off: start close to Earth, pull back onto the route when the intro ends
    const startPos = new THREE.Vector3(5, -2, 17);
    const startLook = STOPS[0].pos.clone();
    let launchAt = window.__introDone ? 0 : Infinity;
    const onIntro = () => (launchAt = time);
    window.addEventListener("intro:done", onIntro);

    let sceneReady = false;
    let ps = scrollFrac();
    let time = 0;
    let lastZ = 0;
    let hudT = 0;
    let raf = 0;
    let last = performance.now();
    const look = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    /* ---------------- planet visits: fly to a stop and orbit it ---------------- */
    const routePos = new THREE.Vector3();
    const routeLook = new THREE.Vector3();
    const fromPos = new THREE.Vector3();
    const fromLook = new THREE.Vector3();
    const destPos = new THREE.Vector3();
    const destLook = new THREE.Vector3();
    const vF = new THREE.Vector3(), vR = new THREE.Vector3(), vU = new THREE.Vector3();
    const WORLD_UP = new THREE.Vector3(0, 1, 0);
    let mode: "route" | "visit" = "route";
    let visitIdx = 0;
    let flyT = 1;
    let flyDur = 2;
    const sunYaw = Math.atan2(sun.x, sun.z);
    const orbit = { yaw: 0, pitch: 0, dist: 1, tYaw: 0, tPitch: 0, tDist: 1, min: 1, max: 1 };

    const orbitFor = (i: number) => {
      const s = STOPS[i];
      if (!s.kind) return { dist: 15 * BH_SCALE, min: 6.5 * BH_SCALE, max: 45 * BH_SCALE, pitch: 0.12 };
      if (s.kind === "SATURN") return { dist: s.r * 4.4, min: s.r * 2.6, max: s.r * 9, pitch: 0.32 };
      return { dist: s.r * 2.9, min: s.r * 1.5, max: s.r * 8, pitch: 0.16 };
    };
    const visitPose = () => {
      const c = STOPS[visitIdx].pos;
      const cp = Math.cos(orbit.pitch);
      destPos.set(cp * Math.sin(orbit.yaw), Math.sin(orbit.pitch), cp * Math.cos(orbit.yaw)).multiplyScalar(orbit.dist).add(c);
      // frame the planet beside the info panel: right of centre on desktop, above it on phones
      vF.subVectors(c, destPos).normalize();
      vR.crossVectors(vF, WORLD_UP).normalize();
      vU.crossVectors(vR, vF);
      const k = orbit.dist * 0.2;
      destLook.copy(c);
      if (window.innerWidth >= 1024) destLook.addScaledVector(vR, -k);
      else destLook.addScaledVector(vU, -k * 0.9);
    };
    const startFly = () => {
      fromPos.copy(camera.position);
      fromLook.copy(look);
      flyT = reduce ? 1 : 0;
      if (mode === "visit") visitPose();
      const d = fromPos.distanceTo(mode === "visit" ? destPos : routePos);
      flyDur = THREE.MathUtils.clamp(1.3 + d / 900, 1.5, 4.2);
    };
    const open = (i: number) => {
      if (!window.__introDone) return;
      const o = orbitFor(i);
      visitIdx = i;
      orbit.yaw = orbit.tYaw = sunYaw - 0.55 + (i % 2 ? 0.35 : -0.2);
      orbit.pitch = orbit.tPitch = o.pitch;
      orbit.dist = orbit.tDist = o.dist;
      orbit.min = o.min;
      orbit.max = o.max;
      mode = "visit";
      startFly();
      setHover(null);
      setVisit(i);
    };
    const close = () => {
      if (mode !== "visit") return;
      mode = "route";
      startFly();
      setVisit(null);
    };
    const step = (d: number) => {
      if (mode === "visit") open((visitIdx + d + STOPS.length) % STOPS.length);
    };
    actions.current = { open, close, step };

    const onVisitEvent = (e: Event) => {
      const i = STOPS.findIndex((s) => s.name === (e as CustomEvent<string>).detail);
      if (i >= 0) open(i);
    };
    const onKey = (e: KeyboardEvent) => {
      if (mode !== "visit") return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    // orbit controls — listen on the window: the canvas sits behind <body> and never gets pointer events
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    const touches = new Map<number, { x: number; y: number }>();
    let pinchStart = 0, pinchDist = 0;
    const onDown = (e: PointerEvent) => {
      if (mode !== "visit" || isUI(e.target)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
        pinchDist = orbit.tDist;
        dragging = false;
        return;
      }
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      document.documentElement.dataset.dragging = "1";
    };
    const onDrag = (e: PointerEvent) => {
      if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2 && pinchStart > 0) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        orbit.tDist = THREE.MathUtils.clamp((pinchDist * pinchStart) / Math.max(d, 1), orbit.min, orbit.max);
        idle = 0;
        return;
      }
      if (!dragging) return;
      orbit.tYaw -= (e.clientX - lastX) * 0.006;
      orbit.tPitch = THREE.MathUtils.clamp(orbit.tPitch + (e.clientY - lastY) * 0.005, -1.25, 1.25);
      lastX = e.clientX;
      lastY = e.clientY;
      idle = 0;
    };
    const onUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinchStart = 0;
      dragging = false;
      delete document.documentElement.dataset.dragging;
    };
    const onWheel = (e: WheelEvent) => {
      if (mode !== "visit" || isUI(e.target)) return;
      e.preventDefault();
      orbit.tDist = THREE.MathUtils.clamp(orbit.tDist * Math.exp(e.deltaY * 0.0012), orbit.min, orbit.max);
      idle = 0;
    };

    // click a planet in the background to visit it
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let pointerMoved = false, pointerX = 0, pointerY = 0, overUI = true, hovered: number | null = null;
    const isUI = (t: EventTarget | null) => !!(t as Element | null)?.closest?.("a, button, input, textarea, .glass, header, nav");
    const pickAt = (): number | null => {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      if (hit) return pickIndex.get(hit.object) ?? null;
      // the black hole has no mesh: test against its on-screen disk
      if (postMat.uniforms.uBHOn.value > 0.5) {
        tmp.copy(bh.pos).project(camera);
        if (tmp.z < 1) {
          const d = camera.position.distanceTo(bh.pos);
          const rad = Math.atan((9 * BH_SCALE) / d) / THREE.MathUtils.degToRad(camera.fov / 2);
          if (Math.hypot((ndc.x - tmp.x) * camera.aspect, ndc.y - tmp.y) < Math.max(rad, 0.08)) return STOPS.length - 1;
        }
      }
      return null;
    };
    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      overUI = isUI(e.target);
      pointerMoved = true;
    };
    const onClick = (e: MouseEvent) => {
      if (mode !== "route" || !window.__introDone || isUI(e.target)) return;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      const i = pickAt();
      if (i !== null) open(i);
    };

    window.addEventListener("visit:open", onVisitEvent);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("wheel", onWheel, { passive: false });

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
      const lift = reduce ? 0 : 1 - smooth(Math.min(1, Math.max(0, (time - launchAt) / 3.2)));
      if (lift > 0) {
        camera.position.lerp(startPos, lift);
        look.lerp(startLook, lift);
      }

      // visiting a planet (or flying to / from one)
      routePos.copy(camera.position);
      routeLook.copy(look);
      if (mode === "visit" || flyT < 1) {
        const k = 1 - Math.exp(-dt * 5);
        if (!dragging) {
          idle += dt;
          if (idle > 1.5 && !reduce) orbit.tYaw += dt * 0.04;
        }
        orbit.yaw += (orbit.tYaw - orbit.yaw) * k;
        orbit.pitch += (orbit.tPitch - orbit.pitch) * k;
        orbit.dist += (orbit.tDist - orbit.dist) * k;
        if (mode === "visit") visitPose();
        else {
          destPos.copy(routePos);
          destLook.copy(routeLook);
        }
        if (flyT < 1) {
          flyT = Math.min(1, flyT + dt / flyDur);
          const f = flyT < 0.5 ? 4 * flyT ** 3 : 1 - (-2 * flyT + 2) ** 3 / 2;
          camera.position.lerpVectors(fromPos, destPos, f);
          camera.position.y += Math.sin(Math.PI * f) * Math.min(fromPos.distanceTo(destPos) * 0.06, 30);
          look.lerpVectors(fromLook, destLook, f);
        } else {
          camera.position.copy(destPos);
          look.copy(destLook);
        }
      }

      const vz = mode === "route" && flyT >= 1 ? (lastZ - z) / Math.max(dt, 1e-4) : 0;
      lastZ = z;
      camera.up.set(THREE.MathUtils.clamp(vz * 0.0004, -0.06, 0.06), 1, 0).normalize();
      camera.lookAt(look);
      camera.updateMatrixWorld();
      far.position.copy(camera.position);

      // hover label for clickable planets
      if (pointerMoved) {
        pointerMoved = false;
        const h = mode === "route" && flyT >= 1 && !overUI && window.__introDone ? pickAt() : null;
        if (h !== hovered) {
          hovered = h;
          setHover(h);
        }
      }
      if (hovered !== null && hoverLabel.current) {
        hoverLabel.current.style.transform = `translate(${pointerX + 18}px, ${pointerY + 14}px)`;
      }

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
      if (!sceneReady) {
        sceneReady = true;
        markSceneReady();
      }

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
      window.removeEventListener("intro:done", onIntro);
      window.removeEventListener("visit:open", onVisitEvent);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onDrag);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("wheel", onWheel);
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
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 size-full bg-black"
      />

      {/* "visit" label that follows the pointer over a planet */}
      <div
        ref={hoverLabel}
        aria-hidden
        className={`label pointer-events-none fixed left-0 top-0 z-50 flex items-center gap-2 whitespace-nowrap rounded-full border border-gold/40 bg-black/60 px-3 py-1.5 text-gold backdrop-blur-md transition-opacity duration-200 ${hover !== null ? "opacity-100" : "opacity-0"}`}
      >
        Visit {hover !== null ? STOPS[hover].name : ""} <ArrowRight className="size-3" />
      </div>

      {/* planet visit panel */}
      <AnimatePresence>
        {visit !== null && (
          <motion.div
            key="visit-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            <div className="pointer-events-auto absolute right-5 top-5 md:right-10 md:top-8">
              <button
                onClick={() => actions.current.close()}
                className="label flex items-center gap-2 rounded-full border border-paper/20 bg-black/50 px-4 py-2.5 text-paper/80 backdrop-blur-md transition hover:border-gold hover:text-gold"
              >
                Return to journey <X className="size-3.5" />
              </button>
            </div>

            <div className="label absolute left-1/2 top-8 hidden -translate-x-1/2 text-paper/40 md:block">
              Drag to orbit · Scroll to zoom · Esc to return
            </div>

            <div className="pointer-events-auto absolute inset-x-3 bottom-3 md:inset-x-auto md:bottom-10 md:left-10 md:w-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={visit}
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="glass rounded-2xl bg-black/40 p-6 md:p-7"
                >
                  <div className="label flex items-center justify-between text-paper/50">
                    <span>
                      <span className="text-gold">{STOPS[visit].kind ? "Orbiting" : "Event horizon"}</span> · {String(visit + 1).padStart(2, "0")} / {String(STOPS.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-[1.9rem] uppercase leading-tight">{STOPS[visit].name}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-paper/70">{PLANET_INFO[STOPS[visit].name]?.tagline}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-paper/10 pt-5">
                    {PLANET_INFO[STOPS[visit].name]?.facts.map(([k, v]) => (
                      <div key={k}>
                        <dt className="label text-[10px] text-paper/45">{k}</dt>
                        <dd className="mt-1 text-lg text-paper">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-paper/10 pt-5">
                    <div className="flex gap-2">
                      <button
                        aria-label="Previous planet"
                        onClick={() => actions.current.step(-1)}
                        className="grid size-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition hover:border-gold hover:text-gold"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <button
                        aria-label="Next planet"
                        onClick={() => actions.current.step(1)}
                        className="grid size-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition hover:border-gold hover:text-gold"
                      >
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const id = STOPS[visit].section;
                        actions.current.close();
                        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
                      }}
                      className="label flex items-center gap-2 text-gold transition hover:text-paper"
                    >
                      {PLANET_INFO[STOPS[visit].name]?.section} <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {failed && <div aria-hidden className="fixed inset-0 -z-10 bg-[#04050d]" />}
      {/* trajectory rail */}
      <nav aria-label="Journey" className={`fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${visit !== null ? "pointer-events-none opacity-0" : ""}`}>
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
      <div aria-hidden className={`label pointer-events-none fixed right-6 top-20 z-30 hidden text-right leading-loose text-paper/45 transition-opacity duration-500 md:block md:right-10 ${visit !== null ? "opacity-0" : ""}`}>
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
