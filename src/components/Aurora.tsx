/* ──────────────────────────────────────────────────────────────
   src/components/Aurora.tsx
   Animated aurora background – WebGL 2
──────────────────────────────────────────────────────────────── */
"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import styles from "./Aurora.module.css";

/* ─────────────── GLSL ─────────────── */
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

/* uniforms */
uniform float  uTime;
uniform float  uAmplitude;
uniform vec3   uColorStops[3];
uniform vec2   uResolution;
uniform float  uBlend;

layout(location = 0) out vec4 fragColor;   /* 📌 bind output */

vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }

/* ── simplex noise, colour-ramp etc.  (unchanged) ── */
float snoise(vec2 v){
    const vec4 C = vec4(
        0.211324865405187, 0.366025403784439,
       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(
                    dot(x0,x0),
                    dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0*fract(p* C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x * x0.x  + h.x  * x0.y;
    g.yz = a0.yz* x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

struct ColorStop { vec3 color; float position; };
#define COLOR_RAMP(colors, factor, finalColor)                   \
{                                                                \
  int idx = 0;                                                   \
  for (int i = 0; i < 2; i++) {                                  \
    bool inRange = colors[i].position <= factor;                 \
    idx = int(mix(float(idx), float(i), float(inRange)));        \
  }                                                              \
  ColorStop c0 = colors[idx];                                    \
  ColorStop c1 = colors[idx + 1];                                \
  float span  = c1.position - c0.position;                       \
  float lerpF = (factor - c0.position) / span;                   \
  finalColor  = mix(c0.color, c1.color, lerpF);                  \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  /* colour ramp */
  ColorStop stops[3];
  stops[0] = ColorStop(uColorStops[0], 0.0);
  stops[1] = ColorStop(uColorStops[1], 0.5);
  stops[2] = ColorStop(uColorStops[2], 1.0);
  vec3 rampColor;
  COLOR_RAMP(stops, uv.x, rampColor);

  /* height field */
  float h = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25))
            * 0.5 * uAmplitude;
  h = exp(h);
  h = (uv.y * 2.0 - h + 0.2);
  float intensity = 0.6 * h;

  /* alpha fall-off */
  float mid = 0.20;
  float alpha = smoothstep(mid - uBlend * 0.5, mid + uBlend * 0.5, intensity);

  vec3 finalCol = intensity * rampColor;
  fragColor = vec4(finalCol * alpha, alpha);
}
`;

/* ─────────────── props ─────────────── */
export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  time?: number;
}

export default function Aurora({
  colorStops = ["#5227FF", "#7cff67", "#5227FF"],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
}: AuroraProps) {
  const latest = useRef<AuroraProps>({
    colorStops,
    amplitude,
    blend,
    speed,
  });
  latest.current = { colorStops, amplitude, blend, speed };

  const holderRef = useRef<HTMLDivElement>(null);

  useEffect((): (() => void) | void => {
    const holder = holderRef.current;
    if (!holder) return;

    /* 👉  use `webgl: 2` here  */
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      webgl: 2, // << fixed
    });
    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.background = "transparent";

    const geo = new Triangle(gl);
    if (geo.attributes.uv) delete (geo.attributes as any).uv;

    const toRGB = (hex: string): [number, number, number] => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend },
        uColorStops: { value: colorStops.map(toRGB) },
        uResolution: { value: [holder.offsetWidth, holder.offsetHeight] },
      },
    });

    const mesh = new Mesh(gl, { geometry: geo, program });
    holder.appendChild(gl.canvas);

    const resize = (): void => {
      renderer.setSize(holder.offsetWidth, holder.offsetHeight);
      program.uniforms.uResolution.value = [
        holder.offsetWidth,
        holder.offsetHeight,
      ];
    };
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    const loop = (t: number): void => {
      raf = requestAnimationFrame(loop);
      const { speed: spd = 1 } = latest.current;

      program.uniforms.uTime.value = t * 0.001 * spd;
      program.uniforms.uAmplitude.value = latest.current.amplitude ?? 1;
      program.uniforms.uBlend.value = latest.current.blend ?? 0.5;
      program.uniforms.uColorStops.value = (
        latest.current.colorStops ?? colorStops
      ).map(toRGB);

      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    return (): void => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (holder.contains(gl.canvas)) holder.removeChild(gl.canvas);
    };
  }, []); // run once

  return <div ref={holderRef} className={styles.container} />;
}
