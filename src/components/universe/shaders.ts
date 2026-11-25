// GLSL for the universe scene. Everything is procedural — no texture downloads.

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float f=0.0,a=0.5;for(int i=0;i<6;i++){f+=a*snoise(p);p*=2.03;a*=0.5;}return f;}
float fbm3(vec3 p){float f=0.0,a=0.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.03;a*=0.5;}return f;}
`;

export const PLANET_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vObj;
varying vec3 vWorld;
void main(){
  vObj = position;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

// One fragment shader, specialised per planet with a #define
export const PLANET_FRAG = /* glsl */ `
uniform vec3 uSun;
uniform float uTime;
uniform vec3 uAtmo;
uniform vec3 uCenter;
uniform vec3 uRingN;
uniform float uRingIn;
uniform float uRingOut;
varying vec3 vN;
varying vec3 vObj;
varying vec3 vWorld;
${NOISE}

void main(){
  vec3 N = normalize(vN);
  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 p = normalize(vObj);
  float ndl = dot(N, L);
  float day = smoothstep(-0.06, 0.32, ndl);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 col;

#if defined(EARTH)
  float h = fbm(p * 2.1) * 0.65 + fbm(p * 7.0) * 0.18;
  float lat = abs(p.y);
  float land = smoothstep(0.03, 0.07, h);
  vec3 ocean = mix(vec3(0.004, 0.025, 0.07), vec3(0.02, 0.11, 0.2), smoothstep(-0.3, 0.05, h));
  float dry = fbm3(p * 3.5 + 5.0);
  vec3 landc = mix(vec3(0.05, 0.11, 0.035), vec3(0.24, 0.19, 0.11), smoothstep(-0.15, 0.3, dry));
  landc = mix(landc, vec3(0.5, 0.42, 0.29), smoothstep(0.22, 0.45, dry) * (1.0 - smoothstep(0.15, 0.55, lat)));
  landc = mix(landc, vec3(0.32, 0.3, 0.28), smoothstep(0.32, 0.55, h));
  col = mix(ocean, landc, land);
  float ice = smoothstep(0.74, 0.8, lat + fbm3(p * 5.0) * 0.08);
  col = mix(col, vec3(0.82, 0.86, 0.9), ice);

  vec3 cp = p + vec3(uTime * 0.004, 0.0, uTime * 0.002);
  float c = fbm(cp * 2.6 + fbm3(cp * 1.4) * 0.6);
  float clouds = smoothstep(0.02, 0.5, c) * 0.95;

  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 80.0) * (1.0 - land) * (1.0 - clouds);
  vec3 lit = col * (day * 1.15 + 0.004);
  lit += spec * vec3(1.0, 0.86, 0.66) * 1.4 * day;
  lit = mix(lit, vec3(0.95) * (day * 1.08 + 0.004), clouds);

  float night = 1.0 - smoothstep(-0.25, 0.02, ndl);
  float city = smoothstep(0.62, 0.95, snoise(p * 90.0) * 0.5 + snoise(p * 23.0) * 0.6) * land * (1.0 - ice) * (1.0 - clouds * 0.8);
  lit += night * city * vec3(1.0, 0.62, 0.28) * 0.7;
  col = lit;

#elif defined(MARS)
  float h = fbm(p * 2.4);
  float d = fbm3(p * 6.5 + 3.0);
  col = mix(vec3(0.36, 0.13, 0.05), vec3(0.62, 0.31, 0.15), smoothstep(-0.35, 0.45, h));
  col = mix(col, vec3(0.2, 0.08, 0.04), smoothstep(0.05, 0.5, d) * 0.55);
  float cr = smoothstep(0.55, 0.75, snoise(p * 16.0)) * 0.22 + smoothstep(0.6, 0.8, snoise(p * 40.0)) * 0.12;
  col *= 1.0 - cr;
  col = mix(col, vec3(0.88, 0.85, 0.82), smoothstep(0.87, 0.91, abs(p.y) + fbm3(p * 6.0) * 0.04));
  col = col * (day + 0.004);

#elif defined(JUPITER)
  float lat = p.y;
  vec3 q = vec3(p.x * 2.0, p.y * 9.0, p.z * 2.0) + vec3(uTime * 0.01, 0.0, 0.0);
  float warp = fbm(q + fbm3(q * 1.7) * 0.8);
  float b = lat * 11.0 + warp * 1.5;
  float band = sin(b) * 0.5 + 0.5;
  col = mix(vec3(0.42, 0.28, 0.18), vec3(0.86, 0.79, 0.66), band);
  col = mix(col, vec3(0.7, 0.52, 0.36), smoothstep(0.35, 0.75, sin(b * 2.3 + 1.0) * 0.5 + 0.5) * 0.45);
  col = mix(col, vec3(0.94, 0.91, 0.85), smoothstep(0.45, 0.85, fbm(p * vec3(5.0, 22.0, 5.0))) * 0.35);
  col *= mix(1.0, 0.55, smoothstep(0.55, 0.97, abs(lat)));
  float ang = atan(p.z, p.x);
  vec2 sp = vec2(ang - 0.9, (lat + 0.34) * 3.2);
  float sw = fbm3(vec3(sp * 6.0, 1.0)) * 0.03;
  float spot = 1.0 - smoothstep(0.1, 0.2, length(sp * vec2(1.0, 1.5)) + sw);
  col = mix(col, vec3(0.66, 0.3, 0.17), spot * 0.85);
  col = col * (day + 0.003);

#elif defined(SATURN)
  float warp = fbm3(vec3(p.x * 1.5, p.y * 6.0, p.z * 1.5));
  float b = sin((p.y + warp * 0.05) * 24.0) * 0.5 + 0.5;
  col = mix(vec3(0.74, 0.63, 0.45), vec3(0.88, 0.8, 0.62), b);
  col = mix(col, vec3(0.55, 0.52, 0.47), smoothstep(0.65, 0.95, abs(p.y)) * 0.6);
  // shadow of the rings on the planet
  float sh = 1.0;
  float dn = dot(L, uRingN);
  if (abs(dn) > 0.0001) {
    float t = dot(uCenter - vWorld, uRingN) / dn;
    if (t > 0.0) {
      float rr = length(vWorld + L * t - uCenter);
      if (rr > uRingIn && rr < uRingOut) sh = 0.35;
    }
  }
  col = col * (day * sh + 0.003);
#endif

  // atmospheric scattering at the limb
  col += uAtmo * fres * smoothstep(-0.25, 0.45, ndl) * 0.55;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const ATMO_VERT = /* glsl */ `
varying vec3 vNv;
varying vec3 vNw;
varying vec3 vViewPos;
void main(){
  vNv = normalize(normalMatrix * normal);
  vNw = normalize(mat3(modelMatrix) * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSun;
uniform float uThickness;
varying vec3 vNv;
varying vec3 vNw;
varying vec3 vViewPos;
void main(){
  vec3 V = normalize(-vViewPos);
  float e = clamp(-dot(normalize(vNv), V), 0.0, 1.0);
  float glow = pow(clamp(e / uThickness, 0.0, 1.0), 2.2);
  float light = smoothstep(-0.35, 0.5, dot(normalize(vNw), normalize(uSun)));
  gl_FragColor = vec4(uColor * glow * light * 1.3, 1.0);
}
`;

export const RING_VERT = /* glsl */ `
varying vec2 vLocal;
varying vec3 vWorld;
void main(){
  vLocal = position.xy;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const RING_FRAG = /* glsl */ `
uniform float uInner;
uniform float uOuter;
uniform vec3 uSun;
uniform vec3 uCenter;
uniform float uR;
uniform vec3 uRingN;
varying vec2 vLocal;
varying vec3 vWorld;
${NOISE}
void main(){
  float r = length(vLocal);
  float t = (r - uInner) / (uOuter - uInner);
  float n1 = snoise(vec3(t * 55.0, 1.3, 0.0)) * 0.5 + 0.5;
  float n2 = snoise(vec3(t * 230.0, 4.1, 0.0)) * 0.5 + 0.5;
  float dens = mix(0.25, 1.0, n1) * mix(0.65, 1.0, n2);
  dens *= smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(0.92, 1.0, t));
  dens *= mix(0.06, 1.0, smoothstep(0.012, 0.032, abs(t - 0.64)));
  dens *= mix(0.35, 1.0, smoothstep(0.05, 0.3, t));
  vec3 col = mix(vec3(0.55, 0.49, 0.4), vec3(0.86, 0.79, 0.65), n1);
  vec3 L = normalize(uSun);
  vec3 oc = vWorld - uCenter;
  float b = dot(oc, L);
  float c = dot(oc, oc) - uR * uR;
  float sh = (b < 0.0 && b * b - c > 0.0) ? 0.05 : 1.0;
  float lit = 0.3 + 0.7 * abs(dot(uRingN, L));
  gl_FragColor = vec4(col * lit * sh, dens * 0.9);
}
`;

export const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
varying vec3 vColor;
uniform float uDpr;
void main(){
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr;
  gl_Position = projectionMatrix * mv;
}
`;

export const STAR_FRAG = /* glsl */ `
varying vec3 vColor;
uniform float uOpacity;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d) * 4.0;
  float a = exp(-r2 * 6.0) + exp(-r2 * 40.0) * 0.6;
  gl_FragColor = vec4(vColor * a * uOpacity, 1.0);
}
`;

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// faint Milky Way band with dust lanes
export const SKY_FRAG = /* glsl */ `
varying vec3 vDir;
${NOISE}
void main(){
  vec3 d = normalize(vDir);
  vec3 G = normalize(vec3(0.35, 1.0, 0.25));
  float lat = dot(d, G);
  float band = exp(-pow(lat / 0.2, 2.0));
  vec3 core = normalize(vec3(-0.6, -0.15, -1.0));
  float coreGlow = exp(-pow(length(d - core) * 1.6, 2.0));
  float n = fbm(d * 3.0) * 0.5 + 0.5;
  float dust = smoothstep(0.05, 0.55, fbm(d * 7.0 + 2.0)) * smoothstep(0.35, 0.0, abs(lat));
  float glow = band * (0.35 + 0.65 * n) + coreGlow * band * 1.5;
  vec3 col = mix(vec3(0.5, 0.52, 0.62), vec3(0.85, 0.72, 0.55), coreGlow) * glow * 0.075;
  col *= 1.0 - dust * 0.85;
  col += vec3(0.18, 0.08, 0.22) * smoothstep(0.25, 0.9, fbm3(d * 2.0 + 7.0)) * 0.025;
  col += vec3(0.05, 0.1, 0.2) * smoothstep(0.3, 0.9, fbm3(d * 1.6 - 3.0)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Final pass: ray-traced Schwarzschild black hole that lenses the rendered scene, plus filmic grading.
export const POST_FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform mat4 uViewProj;
uniform vec3 uCamPos;
uniform vec3 uBH;
uniform float uBHScale;
uniform float uBHOn;
uniform mat3 uBHRot;
uniform mat3 uBHRotInv;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;
${NOISE}

float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec3 starsProc(vec3 d){
  vec3 q = floor(d * 260.0);
  float h = hash13(q);
  return vec3(0.95, 0.93, 1.0) * step(0.9975, h) * (h - 0.9975) * 300.0;
}
vec3 rayDir(vec2 uv){
  vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  v /= v.w;
  return normalize((uCamWorld * vec4(v.xyz, 0.0)).xyz);
}
vec3 sampleDir(vec3 d){
  vec4 c = uViewProj * vec4(uCamPos + d * 100.0, 1.0);
  if (c.w > 0.0) {
    vec2 uv = c.xy / c.w * 0.5 + 0.5;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) return texture2D(tScene, uv).rgb;
  }
  return starsProc(d);
}
vec3 diskColor(vec3 hit, vec3 rayV, out float alpha){
  float r = length(hit.xz);
  float temp = pow(2.6 / r, 0.75);
  vec3 c = mix(vec3(0.5, 0.09, 0.02), vec3(1.0, 0.55, 0.2), smoothstep(0.12, 0.5, temp));
  c = mix(c, vec3(1.0, 0.93, 0.82), smoothstep(0.5, 0.95, temp));
  float rot = uTime * 1.4 / pow(r, 1.5);
  float cs = cos(rot), sn = sin(rot);
  vec2 q = mat2(cs, -sn, sn, cs) * hit.xz;
  float n = fbm(vec3(normalize(q) * 2.2, r * 1.6)) * 0.5 + 0.5;
  float streak = fbm3(vec3(normalize(q) * 9.0, r * 5.0)) * 0.5 + 0.5;
  vec3 orbit = normalize(vec3(-hit.z, 0.0, hit.x));
  float beta = 0.55 * sqrt(1.0 / r);
  float dop = 1.0 / (1.0 - beta * dot(orbit, -normalize(rayV)) * 1.6);
  dop = clamp(dop, 0.35, 2.6);
  float I = temp * temp * (0.45 + 0.9 * n) * (0.7 + 0.5 * streak) * pow(dop, 3.0);
  c = mix(c, vec3(0.85, 0.9, 1.0), clamp((dop - 1.2) * 0.4, 0.0, 0.5));
  alpha = smoothstep(2.6, 3.4, r) * (1.0 - smoothstep(9.0, 14.0, r)) * clamp(0.35 + n * 0.9, 0.0, 1.0);
  return c * I * 1.15;
}

void main(){
  vec3 col = texture2D(tScene, vUv).rgb;

  if (uBHOn > 0.001) {
    vec3 rd = rayDir(vUv);
    vec3 ro = uBHRot * ((uCamPos - uBH) / uBHScale);
    vec3 v = uBHRot * rd;
    float b = length(cross(ro, v));
    if (b < 40.0) {
      float h2 = b * b;
      vec3 p = ro;
      vec4 disk = vec4(0.0);
      bool captured = false;
      float r0 = length(ro);
      for (int i = 0; i < 220; i++) {
        float r = length(p);
        float dt = clamp(0.07 * r, 0.025, 3.0);
        vec3 acc = -1.5 * h2 * p / pow(r, 5.0);
        v += acc * dt;
        vec3 pn = p + v * dt;
        if (p.y * pn.y < 0.0 && disk.a < 0.99) {
          vec3 hit = mix(p, pn, p.y / (p.y - pn.y));
          float rh = length(hit.xz);
          if (rh > 2.6 && rh < 14.0) {
            float a;
            vec3 dc = diskColor(hit, v, a);
            disk.rgb += (1.0 - disk.a) * dc * a;
            disk.a += (1.0 - disk.a) * a;
          }
        }
        p = pn;
        float rn = length(p);
        if (rn < 1.0) { captured = true; break; }
        if (rn > max(r0, 50.0) + 4.0 && dot(p, v) > 0.0) break;
      }
      vec3 bg = captured ? vec3(0.0) : sampleDir(uBHRotInv * normalize(v));
      vec3 bh = disk.rgb + bg * (1.0 - disk.a);
      float edge = 1.0 - smoothstep(30.0, 40.0, b);
      col = mix(col, bh, uBHOn * edge);
    }
  }

  // filmic tonemap, vignette, grain
  col = vec3(1.0) - exp(-col * 1.35);
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * 0.55;
  float g = fract(sin(dot(vUv * uRes + uTime * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}
`;
