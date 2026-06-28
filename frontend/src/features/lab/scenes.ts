import * as THREE from "three";
import type { SceneInit, ParamValues } from "./three-scene";
import type { LabChartData } from "./lab-chart";

const AMBER = 0xe2a43b;
const AMBER_LIGHT = 0xefc97e;
const INDIGO = 0x7a6bff;

// ── tiny typed param readers (with fallbacks) ──
const num = (p: ParamValues, k: string, d: number) =>
  typeof p[k] === "number" ? (p[k] as number) : d;
const bool = (p: ParamValues, k: string, d: boolean) =>
  typeof p[k] === "boolean" ? (p[k] as boolean) : d;
const str = (p: ParamValues, k: string, d: string) =>
  typeof p[k] === "string" ? (p[k] as string) : d;

/* ════════════════════════════════════════════════════════════════
   MATH — live function surface z = f(x, y, t)
   ════════════════════════════════════════════════════════════════ */
const MATH_FN_LABEL: Record<string, string> = {
  ripple: "z = interfering ripples",
  waves: "z = sin(x)·cos(y)",
  saddle: "z = x² − y²",
  monkey: "z = x³ − 3xy²",
};

function mathHeight(fn: string, x: number, z: number, t: number, amp: number, freq: number) {
  switch (fn) {
    case "saddle":
      return (x * x - z * z) * 0.05 * amp;
    case "waves":
      return Math.sin(x * freq + t) * Math.cos(z * freq + t * 0.9) * 1.2 * amp;
    case "monkey":
      return (x * x * x - 3 * x * z * z) * 0.012 * amp;
    case "ripple":
    default:
      return (
        (Math.sin(x * 0.9 * freq + t) * 0.6 +
          Math.cos(z * 0.9 * freq + t * 0.8) * 0.6 +
          Math.sin((x * x + z * z) * 0.12 - t) * 0.4) *
        amp
      );
  }
}

export function mathReadouts(p: ParamValues) {
  const fn = str(p, "fn", "ripple");
  const amp = num(p, "amp", 1);
  const freq = num(p, "freq", 1);
  let mn = Infinity;
  let mx = -Infinity;
  for (let x = -3; x <= 3; x += 0.25) {
    for (let z = -3; z <= 3; z += 0.25) {
      const y = mathHeight(fn, x, z, 0, amp, freq);
      if (y < mn) mn = y;
      if (y > mx) mx = y;
    }
  }
  return [
    { label: "Function", value: MATH_FN_LABEL[fn] ?? fn },
    { label: "Peak height", value: mx.toFixed(2) },
    { label: "Lowest point", value: mn.toFixed(2) },
    { label: "Amplitude", value: `×${amp.toFixed(2)}` },
  ];
}

export const mathScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 4.2, 8);

  const segments = 64;
  const size = 6;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const count = geo.attributes.position.count;
  geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));

  const surface = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.25,
      roughness: 0.5,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
  );
  group.add(surface);

  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x0b0a14,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    }),
  );
  group.add(wire);

  // faint floor grid for a sense of scale (like a graph plane)
  const grid = new THREE.GridHelper(8, 16, 0x5a5f86, 0x2a2c44);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.18;
  grid.position.y = -2.2;
  group.add(grid);

  const dir = new THREE.DirectionalLight(0xffffff, 1.3);
  dir.position.set(5, 8, 5);
  group.add(dir);
  group.add(new THREE.AmbientLight(0x8899ff, 0.5));
  const point = new THREE.PointLight(INDIGO, 0.9, 30);
  point.position.set(-4, 4, -2);
  group.add(point);

  const pos = geo.attributes.position;
  const col = geo.attributes.color;
  const color = new THREE.Color();
  let time = 0;

  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    wire.visible = bool(params, "wireframe", false);
    const fn = str(params, "fn", "ripple");
    const amp = num(params, "amp", 1);
    const freq = num(params, "freq", 1);
    const range = 1.9 * amp || 1;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = mathHeight(fn, x, z, time, amp, freq);
      pos.setY(i, y);
      const n = Math.max(0, Math.min(1, y / range / 2 + 0.5));
      color.setHSL(0.7 * (1 - n), 0.85, 0.55);
      col.setXYZ(i, color.r, color.g, color.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeVertexNormals();
  };
};

/* ════════════════════════════════════════════════════════════════
   MATH — parametric Lissajous / harmonograph curve (glowing tube)
   ════════════════════════════════════════════════════════════════ */
export function lissajousReadouts(p: ParamValues) {
  const a = Math.round(num(p, "a", 3));
  const b = Math.round(num(p, "b", 2));
  const c = Math.round(num(p, "c", 4));
  return [
    { label: "Curve", value: `x:y:z = ${a}:${b}:${c}` },
    { label: "X frequency", value: `${a}` },
    { label: "Y frequency", value: `${b}` },
    { label: "Z frequency", value: `${c}` },
  ];
}

export const lissajousScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 1, 9);

  const a = Math.round(num(params, "a", 3));
  const b = Math.round(num(params, "b", 2));
  const c = Math.round(num(params, "c", 4));

  // Build the 3-D Lissajous path, then thicken it into a tube.
  const pts: THREE.Vector3[] = [];
  const N = 600;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    pts.push(
      new THREE.Vector3(
        Math.sin(a * t + Math.PI / 2) * 3,
        Math.sin(b * t) * 2.4,
        Math.sin(c * t) * 3,
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 700, 0.07, 16, true),
    new THREE.MeshStandardMaterial({
      color: AMBER,
      emissive: 0x7a3d00,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
    }),
  );
  group.add(tube);

  // a bright bead that races along the curve to reveal how it's drawn
  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff1d0 }),
  );
  group.add(bead);
  const beadLight = new THREE.PointLight(AMBER_LIGHT, 1.2, 8);
  group.add(beadLight);

  group.add(new THREE.AmbientLight(0x7080ff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 6);
  group.add(key);

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta * 0.25;
    const u = time % 1;
    const pt = curve.getPointAt(u);
    bead.position.copy(pt);
    beadLight.position.copy(pt);
  };
};

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Keplerian orbit sandbox
   ════════════════════════════════════════════════════════════════ */
const ORBIT_DEFS = [
  { r: 3, size: 0.34, color: 0x6ec1ff, speed: 0.95, tilt: 0.05 },
  { r: 4.6, size: 0.5, color: AMBER, speed: 0.62, tilt: 0.22 },
  { r: 6.3, size: 0.42, color: 0x9b8cff, speed: 0.43, tilt: 0.1 },
  { r: 8.1, size: 0.62, color: 0x4fd2a0, speed: 0.31, tilt: 0.32 },
  { r: 9.8, size: 0.38, color: 0xff9e64, speed: 0.24, tilt: 0.16 },
  { r: 11.4, size: 0.55, color: 0xc77dff, speed: 0.19, tilt: 0.28 },
];

export function orbitReadouts(p: ParamValues) {
  const planets = Math.round(num(p, "planets", 4));
  const speed = num(p, "speed", 1);
  const inner = ORBIT_DEFS[0].speed * speed;
  const outer = ORBIT_DEFS[planets - 1].speed * speed;
  return [
    { label: "Planets", value: `${planets}` },
    { label: "Inner speed", value: `${inner.toFixed(2)}×` },
    { label: "Outer speed", value: `${outer.toFixed(2)}×` },
    { label: "Speed ratio", value: `${(inner / outer).toFixed(1)} : 1` },
  ];
}

export const physicsScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 7, 16);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 40, 40),
    new THREE.MeshBasicMaterial({ color: 0xf2b33c }),
  );
  group.add(sun);
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.12 }),
  );
  group.add(corona);
  group.add(new THREE.PointLight(0xffd9a0, 2.8, 120));
  group.add(new THREE.AmbientLight(0x33425f, 0.55));

  const planets = ORBIT_DEFS.map((d, i) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(d.r - 0.015, d.r + 0.015, 140),
      new THREE.MeshBasicMaterial({
        color: 0x99a3c4,
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(d.size, 28, 28),
      new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.6, metalness: 0.15 }),
    );
    group.add(mesh);
    return { mesh, ring, r: d.r, speed: d.speed, phase: i * 1.3, tilt: d.tilt };
  });

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    const count = Math.round(num(params, "planets", 4));
    const speed = num(params, "speed", 1);
    const tiltScale = num(params, "tilt", 1);
    const showRings = bool(params, "showRings", true);
    planets.forEach((p, i) => {
      const on = i < count;
      p.mesh.visible = on;
      p.ring.visible = on && showRings;
      if (!on) return;
      const ang = time * p.speed * speed + p.phase;
      p.mesh.position.set(
        Math.cos(ang) * p.r,
        Math.sin(ang) * p.r * Math.sin(p.tilt * tiltScale),
        Math.sin(ang) * p.r,
      );
    });
    sun.rotation.y = time * 0.2;
  };
};

/* ════════════════════════════════════════════════════════════════
   PHYSICS — pendulum wave (N pendulums of graded length)
   ════════════════════════════════════════════════════════════════ */
const PENDULUM_MAX = 16;

export function pendulumReadouts(p: ParamValues) {
  const count = Math.round(num(p, "count", 12));
  const gravity = num(p, "gravity", 1);
  return [
    { label: "Pendulums", value: `${count}` },
    { label: "Gravity", value: `${gravity.toFixed(2)}×` },
    { label: "Pattern", value: "travelling wave" },
    { label: "Re-sync", value: "every full cycle" },
  ];
}

export const pendulumScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 1.5, 13);

  group.add(new THREE.AmbientLight(0x8090ff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 6, 6);
  group.add(key);
  const warm = new THREE.PointLight(AMBER, 0.9, 30);
  warm.position.set(-3, 2, 4);
  group.add(warm);

  // support bar
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(PENDULUM_MAX * 0.62, 0.16, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x3a3f5c, roughness: 0.7, metalness: 0.2 }),
  );
  bar.position.y = 4;
  group.add(bar);

  const rodMat = new THREE.MeshBasicMaterial({ color: 0x6b6f92, transparent: true, opacity: 0.55 });
  const up = new THREE.Vector3(0, 1, 0);
  const pivotY = 3.92;
  const items = Array.from({ length: PENDULUM_MAX }, (_, i) => {
    const x = (i - (PENDULUM_MAX - 1) / 2) * 0.62;
    const hue = i / PENDULUM_MAX;
    const bobColor = new THREE.Color().setHSL(0.58 - hue * 0.5, 0.7, 0.6);
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshStandardMaterial({ color: bobColor, roughness: 0.45, metalness: 0.25 }),
    );
    group.add(bob);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), rodMat);
    group.add(rod);
    // longer pendulums swing slower → the row drifts in and out of phase
    const length = 2.0 + i * 0.13;
    return { bob, rod, x, length, pivot: new THREE.Vector3(x, pivotY, 0) };
  });

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    const count = Math.round(num(params, "count", 12));
    const gravity = num(params, "gravity", 1);
    const amp = num(params, "amplitude", 0.5);
    items.forEach((it, i) => {
      const on = i < count;
      it.bob.visible = on;
      it.rod.visible = on;
      if (!on) return;
      const omega = Math.sqrt(gravity / it.length) * 2.0;
      const angle = amp * Math.cos(omega * time);
      const bx = it.pivot.x + Math.sin(angle) * it.length;
      const by = it.pivot.y - Math.cos(angle) * it.length;
      it.bob.position.set(bx, by, 0);
      // orient + stretch the rod between pivot and bob
      const midX = (it.pivot.x + bx) / 2;
      const midY = (it.pivot.y + by) / 2;
      it.rod.position.set(midX, midY, 0);
      it.rod.scale.y = it.length;
      it.rod.quaternion.setFromUnitVectors(
        up,
        new THREE.Vector3(bx - it.pivot.x, by - it.pivot.y, 0).normalize(),
      );
    });
  };
};

/* ════════════════════════════════════════════════════════════════
   SCIENCE — DNA double helix (live radius / twist / rungs)
   ════════════════════════════════════════════════════════════════ */
const DNA_PER_TURN = 16;
const DNA_HEIGHT = 8.4;
const DNA_BASE_COLORS = [0xff6b8b, 0x4fd2a0, 0xffd166, 0x6ec1ff];

export function dnaReadouts(p: ParamValues) {
  const turns = Math.round(num(p, "turns", 3));
  const total = turns * DNA_PER_TURN;
  const pairs = Math.floor(total / 2);
  return [
    { label: "Turns", value: `${turns}` },
    { label: "Base pairs", value: `${pairs}` },
    { label: "Backbone nodes", value: `${total * 2}` },
    { label: "Helix radius", value: num(p, "radius", 1.7).toFixed(2) },
  ];
}

export const scienceScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 12);

  group.add(new THREE.AmbientLight(0x8090ff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 6);
  group.add(key);
  const warm = new THREE.PointLight(AMBER, 1.1, 40);
  warm.position.set(-4, -3, 4);
  group.add(warm);

  const turns = Math.round(num(params, "turns", 3));
  const total = turns * DNA_PER_TURN;

  const backboneA = new THREE.MeshStandardMaterial({
    color: AMBER,
    roughness: 0.35,
    metalness: 0.25,
  });
  const backboneB = new THREE.MeshStandardMaterial({
    color: 0x6e8bff,
    roughness: 0.35,
    metalness: 0.25,
  });
  const nodeGeo = new THREE.SphereGeometry(0.23, 18, 18);
  const up = new THREE.Vector3(0, 1, 0);

  const nodes: { mesh: THREE.Mesh; frac: number; offset: number }[] = [];
  const rungs: { mesh: THREE.Mesh; frac: number }[] = [];

  for (let i = 0; i < total; i++) {
    const frac = i / (total - 1);
    const a = new THREE.Mesh(nodeGeo, backboneA);
    group.add(a);
    nodes.push({ mesh: a, frac, offset: 0 });
    const b = new THREE.Mesh(nodeGeo, backboneB);
    group.add(b);
    nodes.push({ mesh: b, frac, offset: Math.PI });

    if (i % 2 === 0) {
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1, 10),
        new THREE.MeshStandardMaterial({
          color: DNA_BASE_COLORS[(i / 2) % DNA_BASE_COLORS.length],
          roughness: 0.5,
        }),
      );
      group.add(rung);
      rungs.push({ mesh: rung, frac });
    }
  }

  return () => {
    const radius = num(params, "radius", 1.7);
    const twist = num(params, "twist", 0);
    const showRungs = bool(params, "showRungs", true);
    const windings = turns * (1 + twist * 0.4);
    for (const n of nodes) {
      const ang = n.frac * windings * Math.PI * 2 + n.offset;
      const y = (n.frac - 0.5) * DNA_HEIGHT;
      n.mesh.position.set(Math.cos(ang) * radius, y, Math.sin(ang) * radius);
    }
    for (const r of rungs) {
      r.mesh.visible = showRungs;
      if (!showRungs) continue;
      const ang = r.frac * windings * Math.PI * 2;
      const y = (r.frac - 0.5) * DNA_HEIGHT;
      const x1 = Math.cos(ang) * radius;
      const z1 = Math.sin(ang) * radius;
      const x2 = Math.cos(ang + Math.PI) * radius;
      const z2 = Math.sin(ang + Math.PI) * radius;
      const len = Math.hypot(x1 - x2, z1 - z2);
      r.mesh.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      r.mesh.scale.y = len;
      r.mesh.quaternion.setFromUnitVectors(up, new THREE.Vector3(x2 - x1, 0, z2 - z1).normalize());
    }
  };
};

/* ════════════════════════════════════════════════════════════════
   SHARED — realistic gear geometry + lighting rig
   ════════════════════════════════════════════════════════════════ */
const clampInt = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

/** A spur-gear tooth profile as [angle, radius] points. `internal` flips the
 *  teeth inward (for ring/annulus gears). Trapezoidal teeth read as machined
 *  steel once lit with an environment map. */
function gearProfile(teeth: number, pitch: number, internal = false): [number, number][] {
  const add = pitch * 0.12;
  const ded = pitch * 0.14;
  const rTip = internal ? pitch - add : pitch + add;
  const rRoot = internal ? pitch + ded : pitch - ded;
  const step = (Math.PI * 2) / teeth;
  const pts: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push([a + step * 0.0, rRoot]);
    pts.push([a + step * 0.3, rRoot]);
    pts.push([a + step * 0.4, rTip]);
    pts.push([a + step * 0.6, rTip]);
    pts.push([a + step * 0.7, rRoot]);
  }
  return pts;
}

function fillPath<T extends THREE.Path | THREE.Shape>(path: T, pts: [number, number][]): T {
  pts.forEach(([ang, r], i) => {
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
  return path;
}

/** A solid extruded spur gear with a central bore and chamfered (bevelled) faces. */
function makeGear(
  teeth: number,
  pitch: number,
  bore: number,
  thickness: number,
  color: number,
): THREE.Mesh {
  const shape = fillPath(new THREE.Shape(), gearProfile(teeth, pitch, false));
  if (bore > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.06,
    bevelSize: pitch * 0.012,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 12,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.computeVertexNormals();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, metalness: 0.92, roughness: 0.34 }),
  );
}

/** A three-point key/fill/rim rig that flatters metals under the PBR env map. */
function addStudioLights(group: THREE.Group) {
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(5, 8, 6);
  group.add(key);
  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.55);
  fill.position.set(-6, 2, 4);
  group.add(fill);
  const rim = new THREE.DirectionalLight(0xffd9a0, 0.7);
  rim.position.set(-3, 4, -6);
  group.add(rim);
  group.add(new THREE.AmbientLight(0x404a5c, 0.45));
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Spur Gear System (two meshing gears, live ratio)
   ════════════════════════════════════════════════════════════════ */
const GEAR_MODULE = 0.34;

export function gearReadouts(p: ParamValues) {
  const n1 = clampInt(num(p, "teeth1", 20), 8, 40);
  const n2 = clampInt(num(p, "teeth2", 36), 8, 60);
  const rpm = num(p, "rpm", 60);
  const ratio = n2 / n1;
  return [
    { label: "Gear ratio", value: `${ratio.toFixed(2)} : 1` },
    { label: "Driver speed", value: `${rpm.toFixed(0)} RPM` },
    { label: "Output speed", value: `${(rpm / ratio).toFixed(0)} RPM` },
    { label: "Torque gain", value: `×${ratio.toFixed(2)}` },
  ];
}

export const gearScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 2.5, 11);
  addStudioLights(group);

  const n1 = clampInt(num(params, "teeth1", 20), 8, 40);
  const n2 = clampInt(num(params, "teeth2", 36), 8, 60);
  const r1 = (GEAR_MODULE * n1) / 2;
  const r2 = (GEAR_MODULE * n2) / 2;
  const thickness = Math.max(r1, r2) * 0.5;

  const driver = makeGear(n1, r1, r1 * 0.28, thickness, 0x9aa6b2);
  const driven = makeGear(n2, r2, r2 * 0.22, thickness, 0x8893a0);
  driven.position.x = r1 + r2;
  group.add(driver, driven);
  group.position.x = -(r1 + r2) / 2;

  // hub caps for a machined look
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x6b7682,
    metalness: 0.95,
    roughness: 0.3,
  });
  const hub1 = new THREE.Mesh(
    new THREE.CylinderGeometry(r1 * 0.3, r1 * 0.3, thickness * 1.15, 24),
    hubMat,
  );
  hub1.rotation.x = Math.PI / 2;
  driver.add(hub1);
  const hub2 = new THREE.Mesh(
    new THREE.CylinderGeometry(r2 * 0.24, r2 * 0.24, thickness * 1.15, 24),
    hubMat,
  );
  hub2.rotation.x = Math.PI / 2;
  driven.add(hub2);

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    const rpm = num(params, "rpm", 60);
    const dir = str(params, "dir", "cw") === "cw" ? 1 : -1;
    const omega = (rpm / 60) * Math.PI * 2;
    driver.rotation.z = -dir * omega * time;
    driven.rotation.z = Math.PI / n2 + dir * omega * time * (n1 / n2);
  };
};

/* ════════════════════════════════════════════════════════════════
   ENGINEERING — Gearbox: compound spur-gear train (speed reduction)
   ════════════════════════════════════════════════════════════════ */
const TRAIN_MODULE = 0.32;
const TRAIN_COLORS = [0xc9a13a, 0x9aa6b2, 0x8893a0, 0xb87333];

export function gearTrainReadouts(p: ParamValues) {
  const counts = [
    clampInt(num(p, "t1", 14), 8, 30),
    clampInt(num(p, "t2", 26), 8, 40),
    clampInt(num(p, "t3", 16), 8, 30),
    clampInt(num(p, "t4", 32), 8, 48),
  ];
  const rpm = num(p, "rpm", 90);
  const ratio = counts[counts.length - 1] / counts[0];
  return [
    { label: "Stages", value: `${counts.length} gears` },
    { label: "Overall ratio", value: `${ratio.toFixed(2)} : 1` },
    { label: "Input speed", value: `${rpm.toFixed(0)} RPM` },
    { label: "Output speed", value: `${(rpm / ratio).toFixed(0)} RPM` },
  ];
}

export const gearTrainScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 2, 13);
  addStudioLights(group);

  const counts = [
    clampInt(num(params, "t1", 14), 8, 30),
    clampInt(num(params, "t2", 26), 8, 40),
    clampInt(num(params, "t3", 16), 8, 30),
    clampInt(num(params, "t4", 32), 8, 48),
  ];

  const gears: { mesh: THREE.Mesh; n: number; offset: number }[] = [];
  let cx = 0;
  let prevR = 0;
  counts.forEach((n, i) => {
    const r = (TRAIN_MODULE * n) / 2;
    if (i > 0) cx += prevR + r;
    const offset = i % 2 ? Math.PI / n : 0;
    const mesh = makeGear(n, r, r * 0.26, r * 0.55, TRAIN_COLORS[i % TRAIN_COLORS.length]);
    mesh.position.x = cx;
    mesh.rotation.z = offset;
    group.add(mesh);
    gears.push({ mesh, n, offset });
    prevR = r;
  });
  group.position.x = -cx / 2;

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    const rpm = num(params, "rpm", 90);
    const omega0 = (rpm / 60) * Math.PI * 2;
    gears.forEach((g, i) => {
      const oi = omega0 * (gears[0].n / g.n) * (i % 2 ? 1 : -1);
      g.mesh.rotation.z = g.offset + oi * time;
    });
  };
};

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Newton's Cradle (conservation of momentum)
   ════════════════════════════════════════════════════════════════ */
const CRADLE_MAX = 7;

export function cradleReadouts(p: ParamValues) {
  const count = clampInt(num(p, "count", 5), 3, CRADLE_MAX);
  const pull = clampInt(num(p, "pull", 1), 1, 3);
  return [
    { label: "Spheres", value: `${count}` },
    { label: "Lifted each side", value: `${pull}` },
    { label: "Conserved", value: "momentum + energy" },
    { label: "Collision", value: "elastic" },
  ];
}

export const cradleScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0.5, 12);
  addStudioLights(group);

  const R = 0.55;
  const L = 4.0;
  const topY = 3.6;
  const spacing = R * 2;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2a2f3d,
    metalness: 0.65,
    roughness: 0.45,
  });
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xd2d8de,
    metalness: 1.0,
    roughness: 0.07,
  });
  const stringMat = new THREE.LineBasicMaterial({
    color: 0x97a0b0,
    transparent: true,
    opacity: 0.6,
  });

  // frame: two top rails + four legs
  const railLen = CRADLE_MAX * spacing + 1.4;
  for (const z of [R, -R]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.16, 0.16), frameMat);
    rail.position.set(0, topY, z);
    group.add(rail);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, topY + L + 0.6, 0.16), frameMat);
      leg.position.set((sx * railLen) / 2, topY - (topY + L + 0.6) / 2 + topY * 0 + L * 0, z);
      leg.position.y = topY - (L + 0.6) / 2;
      group.add(leg);
    }
  }
  const baseBar = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.18, R * 2 + 0.4), frameMat);
  baseBar.position.set(0, topY - L - 0.6, 0);
  group.add(baseBar);

  const balls = Array.from({ length: CRADLE_MAX }, (_, i) => {
    const x = (i - (CRADLE_MAX - 1) / 2) * spacing;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 44, 44), ballMat);
    group.add(ball);
    // V-string: front-top → ball → back-top (one polyline of 3 points)
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, topY, R),
      new THREE.Vector3(x, topY - L, 0),
      new THREE.Vector3(x, topY, -R),
    ]);
    const line = new THREE.Line(geo, stringMat);
    group.add(line);
    return { ball, line, pivotX: x };
  });

  let time = 0;
  return (_e, delta) => {
    if (bool(params, "animate", true)) time += delta;
    const count = clampInt(num(params, "count", 5), 3, CRADLE_MAX);
    const pull = clampInt(num(params, "pull", 1), 1, 3);
    const lift = num(params, "lift", 0.6);
    const speed = num(params, "speed", 1);
    const omega = Math.sqrt(9.8 / L) * speed;
    const s = Math.sin(time * omega);
    const start = Math.floor((CRADLE_MAX - count) / 2);

    balls.forEach((b, idx) => {
      const i = idx - start;
      const active = i >= 0 && i < count;
      b.ball.visible = active;
      b.line.visible = active;
      if (!active) return;
      let ang = 0;
      if (i < pull && s < 0)
        ang = s * lift; // left group lifts when s<0
      else if (i >= count - pull && s > 0) ang = s * lift; // right group lifts when s>0
      const bx = b.pivotX + Math.sin(ang) * L;
      const by = topY - Math.cos(ang) * L;
      b.ball.position.set(bx, by, 0);
      const pos = b.line.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(1, bx, by, 0);
      pos.needsUpdate = true;
    });
  };
};

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Spring & Hooke's Law (simple harmonic motion)
   ════════════════════════════════════════════════════════════════ */
export function springReadouts(p: ParamValues) {
  const k = num(p, "k", 20);
  const m = num(p, "mass", 2);
  const A = num(p, "amp", 1);
  const omega = Math.sqrt(k / m);
  const T = (2 * Math.PI) / omega;
  return [
    { label: "Period T", value: `${T.toFixed(2)} s` },
    { label: "Frequency", value: `${(1 / T).toFixed(2)} Hz` },
    { label: "Angular ω", value: `${omega.toFixed(2)} rad/s` },
    { label: "Max force", value: `${(k * A).toFixed(1)} N` },
  ];
}

export const springScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 11);
  addStudioLights(group);

  const REST = 4;
  const coils = 9;
  const radius = 0.6;
  const segs = coils * 24;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const f = i / segs;
    const ang = f * coils * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(ang) * radius, -f * REST, Math.sin(ang) * radius));
  }
  const springGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, 0.08, 10, false);
  const spring = new THREE.Mesh(
    springGeo,
    new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.9, roughness: 0.3 }),
  );
  spring.position.y = 4;
  group.add(spring);

  const mountMat = new THREE.MeshStandardMaterial({
    color: 0x39414f,
    metalness: 0.5,
    roughness: 0.6,
  });
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 2), mountMat);
  ceiling.position.y = 4.2;
  group.add(ceiling);

  const mass = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.0, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xc28a3a, metalness: 0.8, roughness: 0.35 }),
  );
  group.add(mass);

  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 0),
    1,
    0xff5a44,
    0.32,
    0.22,
  );
  group.add(arrow);

  let time = 0;
  return (_e, delta) => {
    const k = num(params, "k", 20);
    const m = num(params, "mass", 2);
    const A = num(params, "amp", 1);
    const omega = Math.sqrt(k / m);
    if (bool(params, "animate", true)) time += delta;
    const x = A * Math.cos(omega * time); // displacement from equilibrium (+down)
    const len = Math.max(REST * 0.45, REST + 1.0 + x);
    spring.scale.y = len / REST;
    const bottomY = 4 - len;
    mass.position.y = bottomY - 0.5;
    const F = -k * x;
    arrow.visible = bool(params, "showForce", true);
    arrow.position.set(0, mass.position.y, 0);
    arrow.setDirection(new THREE.Vector3(0, F >= 0 ? 1 : -1, 0));
    arrow.setLength(Math.min(2.6, Math.abs(F) * 0.06 + 0.3), 0.32, 0.22);
  };
};

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Double Pendulum (deterministic chaos)
   ════════════════════════════════════════════════════════════════ */
export function doublePendulumReadouts(p: ParamValues) {
  return [
    {
      label: "Arm 1",
      value: `${num(p, "len1", 1.6).toFixed(2)} m · ${num(p, "mass1", 1.4).toFixed(1)} kg`,
    },
    {
      label: "Arm 2",
      value: `${num(p, "len2", 1.6).toFixed(2)} m · ${num(p, "mass2", 1.0).toFixed(1)} kg`,
    },
    { label: "Gravity", value: `${num(p, "gravity", 9.8).toFixed(1)} m/s²` },
    { label: "Behaviour", value: "chaotic" },
  ];
}

export const doublePendulumScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 12);
  addStudioLights(group);
  const up = new THREE.Vector3(0, 1, 0);
  const pivot = new THREE.Vector3(0, 3.4, 0);

  const rodMat = new THREE.MeshStandardMaterial({
    color: 0x9aa6b2,
    metalness: 0.85,
    roughness: 0.35,
  });
  const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 12), rodMat);
  const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 12), rodMat);
  const bob1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x6ec1ff, metalness: 0.6, roughness: 0.28 }),
  );
  const bob2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xe2a43b, metalness: 0.6, roughness: 0.28 }),
  );
  const mount = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), rodMat);
  mount.position.copy(pivot);
  group.add(rod1, rod2, bob1, bob2, mount);

  const TRACE = 260;
  const tracePos = new Float32Array(TRACE * 3);
  const traceGeo = new THREE.BufferGeometry();
  traceGeo.setAttribute("position", new THREE.BufferAttribute(tracePos, 3));
  traceGeo.setDrawRange(0, 0);
  const trace = new THREE.Line(
    traceGeo,
    new THREE.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.5 }),
  );
  group.add(trace);
  let traceN = 0;

  const init = num(params, "initAngle", 1.6);
  let th1 = init;
  let th2 = init + 0.25;
  let w1 = 0;
  let w2 = 0;

  const place = (rod: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    rod.position.copy(mid);
    const dir = b.clone().sub(a);
    rod.scale.y = dir.length();
    rod.quaternion.setFromUnitVectors(up, dir.normalize());
  };

  return (_e, delta) => {
    const L1 = num(params, "len1", 1.6);
    const L2 = num(params, "len2", 1.6);
    const m1 = num(params, "mass1", 1.4);
    const m2 = num(params, "mass2", 1.0);
    const g = num(params, "gravity", 9.8);
    if (bool(params, "animate", true)) {
      const steps = 8;
      const dt = Math.min(delta, 0.05) / steps;
      for (let s = 0; s < steps; s++) {
        const d = th1 - th2;
        const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
        const a1 =
          (-g * (2 * m1 + m2) * Math.sin(th1) -
            m2 * g * Math.sin(th1 - 2 * th2) -
            2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) /
          (L1 * den);
        const a2 =
          (2 *
            Math.sin(d) *
            (w1 * w1 * L1 * (m1 + m2) +
              g * (m1 + m2) * Math.cos(th1) +
              w2 * w2 * L2 * m2 * Math.cos(d))) /
          (L2 * den);
        w1 += a1 * dt;
        w2 += a2 * dt;
        th1 += w1 * dt;
        th2 += w2 * dt;
        w1 *= 0.9999;
        w2 *= 0.9999;
      }
    }
    const p1 = new THREE.Vector3(pivot.x + L1 * Math.sin(th1), pivot.y - L1 * Math.cos(th1), 0);
    const p2 = new THREE.Vector3(p1.x + L2 * Math.sin(th2), p1.y - L2 * Math.cos(th2), 0);
    bob1.position.copy(p1);
    bob1.scale.setScalar(0.7 + m1 * 0.15);
    bob2.position.copy(p2);
    bob2.scale.setScalar(0.7 + m2 * 0.15);
    place(rod1, pivot, p1);
    place(rod2, p1, p2);

    if (bool(params, "animate", true)) {
      const i = traceN % TRACE;
      tracePos[i * 3] = p2.x;
      tracePos[i * 3 + 1] = p2.y;
      tracePos[i * 3 + 2] = p2.z;
      traceN++;
      traceGeo.setDrawRange(0, Math.min(traceN, TRACE));
      (traceGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  };
};

/* ════════════════════════════════════════════════════════════════
   LIVE CHARTS — simulation-native graphs (see lab-chart.tsx).
   Each reads the SAME live `params` as its scene + readouts, reusing
   the exact constants/formulas above so the plot is physically true
   to the 3D model. Adding `chart` to a model is purely additive.
   ════════════════════════════════════════════════════════════════ */
const clampi = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

/** Math surface → a vertical slice z = f(x, 0) through the rendered surface. */
export function mathChart(p: ParamValues): LabChartData {
  const fn = str(p, "fn", "ripple");
  const amp = num(p, "amp", 1);
  const freq = num(p, "freq", 1);
  const pts: [number, number][] = [];
  for (let x = -3; x <= 3.0001; x += 0.08) pts.push([x, mathHeight(fn, x, 0, 0, amp, freq)]);
  return {
    title: "Cross-section · z at y = 0",
    xLabel: "x",
    yLabel: "z",
    series: [{ points: pts, color: "accent", area: true }],
    xDomain: [-3, 3],
    zeroLine: true,
    note: `${MATH_FN_LABEL[fn] ?? fn} — a vertical slice through the 3D surface.`,
  };
}

/** Lissajous → the curve's shadow on the X–Y plane (what the 3D bead traces). */
export function lissajousChart(p: ParamValues): LabChartData {
  const a = clampi(num(p, "a", 3), 1, 7);
  const b = clampi(num(p, "b", 2), 1, 7);
  const pts: [number, number][] = [];
  const N = 400;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    pts.push([Math.sin(a * t), Math.sin(b * t)]);
  }
  return {
    title: "Shadow on the X–Y plane",
    xLabel: "x = sin(a·t)",
    yLabel: "y = sin(b·t)",
    series: [{ points: pts, color: "accent" }],
    xDomain: [-1.12, 1.12],
    yDomain: [-1.12, 1.12],
    square: true,
    note: `Frequency ratio a : b = ${a} : ${b}.`,
  };
}

/** Orbits → Kepler's law: orbital speed vs radius, with each planet on the curve. */
export function orbitChart(p: ParamValues): LabChartData {
  const planets = clampi(num(p, "planets", 4), 2, 6);
  const speed = num(p, "speed", 1);
  const defs = ORBIT_DEFS.slice(0, planets);
  const c = defs[0].speed * Math.sqrt(defs[0].r) * speed; // v = c / √r through the inner planet
  const rMin = defs[0].r;
  const rMax = defs[planets - 1].r;
  const curve: [number, number][] = [];
  const step = (rMax - rMin) / 60 || 1;
  for (let r = rMin; r <= rMax + 0.0001; r += step) curve.push([r, c / Math.sqrt(r)]);
  const dots: [number, number][] = defs.map((d) => [d.r, d.speed * speed]);
  return {
    title: "Kepler · orbital speed vs radius",
    xLabel: "orbital radius r",
    yLabel: "speed v",
    series: [
      { points: curve, color: "accent", dashed: true, label: "v ∝ 1/√r" },
      { points: dots, color: "violet", dots: true, noLine: true, label: "planets" },
    ],
    note: "Farther planets orbit slower — the heart of Kepler's third law.",
  };
}

/** Pendulum wave → a snapshot of the travelling wave across the row. */
export function pendulumChart(p: ParamValues): LabChartData {
  const count = clampi(num(p, "count", 12), 4, 16);
  const amp = num(p, "amplitude", 0.5);
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const phase = (i / (count - 1)) * Math.PI * 2;
    pts.push([i, amp * Math.sin(phase)]);
  }
  return {
    title: "Travelling-wave snapshot",
    xLabel: "pendulum",
    yLabel: "swing",
    series: [{ points: pts, color: "accent", dots: true }],
    yDomain: [-amp * 1.18, amp * 1.18],
    zeroLine: true,
    note: "Graded lengths drift out of phase into a wave along the row.",
  };
}

/** Spur gears → output speed vs driven-gear teeth, with a marker at the current setup. */
export function gearChart(p: ParamValues): LabChartData {
  const n1 = clampi(num(p, "teeth1", 20), 8, 40);
  const n2cur = clampi(num(p, "teeth2", 36), 8, 60);
  const rpm = num(p, "rpm", 60);
  const pts: [number, number][] = [];
  for (let n2 = 8; n2 <= 60; n2 += 2) pts.push([n2, (rpm * n1) / n2]);
  return {
    title: "Output speed vs driven teeth",
    xLabel: "driven teeth N₂",
    yLabel: "output RPM",
    series: [{ points: pts, color: "accent", area: true }],
    markers: [{ x: n2cur, y: (rpm * n1) / n2cur, color: "accent" }],
    xDomain: [8, 60],
    note: "More teeth on the driven gear → slower output, more torque.",
  };
}

/** Gearbox → speed at each gear along the train (idlers vs the input/output pair). */
export function gearTrainChart(p: ParamValues): LabChartData {
  const counts = [
    clampi(num(p, "t1", 14), 8, 30),
    clampi(num(p, "t2", 26), 8, 40),
    clampi(num(p, "t3", 16), 8, 30),
    clampi(num(p, "t4", 32), 8, 48),
  ];
  const rpm = num(p, "rpm", 90);
  const speeds = counts.map((ti) => (rpm * counts[0]) / ti);
  return {
    title: "Speed at each gear in the train",
    kind: "bars",
    yLabel: "RPM",
    categories: ["G1 in", "G2", "G3", "G4 out"],
    series: [{ points: speeds.map((s, i) => [i, s] as [number, number]), color: "accent" }],
    note: "Idler gears flip direction; only the first and last set the ratio.",
  };
}

/** Spring → simple harmonic motion: displacement & velocity over two periods. */
export function springChart(p: ParamValues): LabChartData {
  const k = num(p, "k", 20);
  const m = num(p, "mass", 2);
  const A = num(p, "amp", 1);
  const omega = Math.sqrt(k / m);
  const T = (2 * Math.PI) / omega;
  const tMax = 2 * T;
  const disp: [number, number][] = [];
  const vel: [number, number][] = [];
  const N = 180;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * tMax;
    disp.push([t, A * Math.cos(omega * t)]);
    vel.push([t, -A * Math.sin(omega * t)]); // normalised by ω to share the axis
  }
  return {
    title: "Displacement & velocity over time",
    xLabel: "time (s)",
    yLabel: "x",
    series: [
      { points: disp, color: "accent", area: true, label: "x(t)" },
      { points: vel, color: "violet", dashed: true, label: "v(t)" },
    ],
    xDomain: [0, tMax],
    yDomain: [-A * 1.18, A * 1.18],
    zeroLine: true,
    note: `Period T = ${T.toFixed(2)} s — it stretches as you raise mass or lower k.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   COMPUTER SCIENCE — live sorting visualiser + complexity chart
   A shuffled row of bars sorts itself by replaying a precomputed op
   trace, so the 3D animation matches the algorithm exactly.
   ════════════════════════════════════════════════════════════════ */
const SORT_ALGOS: Record<string, { label: string; quad: boolean }> = {
  bubble: { label: "Bubble sort", quad: true },
  insertion: { label: "Insertion sort", quad: true },
  selection: { label: "Selection sort", quad: true },
  quick: { label: "Quicksort", quad: false },
};

type SortOp = { t: "cmp" | "swap" | "done"; i: number; j?: number };

function buildSortTrace(values: number[], algo: string): SortOp[] {
  const a = values.slice();
  const ops: SortOp[] = [];
  const n = a.length;
  const cmp = (i: number, j: number) => ops.push({ t: "cmp", i, j });
  const swap = (i: number, j: number) => {
    ops.push({ t: "swap", i, j });
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  };
  const done = (i: number) => ops.push({ t: "done", i });

  if (algo === "selection") {
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        cmp(m, j);
        if (a[j] < a[m]) m = j;
      }
      if (m !== i) swap(i, m);
      done(i);
    }
    if (n > 0) done(n - 1);
  } else if (algo === "insertion") {
    if (n > 0) done(0);
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        cmp(j - 1, j);
        if (a[j - 1] > a[j]) {
          swap(j - 1, j);
          j--;
        } else break;
      }
    }
    for (let k = 0; k < n; k++) done(k);
  } else if (algo === "quick") {
    const stack: [number, number][] = [[0, n - 1]];
    while (stack.length) {
      const [lo, hi] = stack.pop()!;
      if (lo >= hi) {
        if (lo === hi) done(lo);
        continue;
      }
      const pivot = a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) {
        cmp(j, hi);
        if (a[j] < pivot) {
          if (i !== j) swap(i, j);
          i++;
        }
      }
      if (i !== hi) swap(i, hi);
      done(i);
      stack.push([lo, i - 1]);
      stack.push([i + 1, hi]);
    }
  } else {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        cmp(j, j + 1);
        if (a[j] > a[j + 1]) swap(j, j + 1);
      }
      done(n - 1 - i);
    }
    if (n > 0) done(0);
  }
  return ops;
}

const SORT_SLATE = 0x6b7c93;
const SORT_AMBER = 0xe2a43b;
const SORT_GREEN = 0x4fd2a0;

export const sortingScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 1.5, 13);
  addStudioLights(group);

  const size = clampInt(num(params, "size", 16), 6, 40);
  const algo = str(params, "algo", "bubble");

  const W = 9;
  const barW = (W / size) * 0.74;
  const baseY = -2.6;
  const maxH = 5.2;

  const shuffle = (n: number) => {
    const v = Array.from({ length: n }, (_, i) => i + 1);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = v[i];
      v[i] = v[j];
      v[j] = t;
    }
    return v;
  };

  let cur = shuffle(size);
  let ops = buildSortTrace(cur, algo);

  const bars: THREE.Mesh[] = [];
  const geom = new THREE.BoxGeometry(barW, 1, barW);
  for (let i = 0; i < size; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: SORT_SLATE,
      metalness: 0.2,
      roughness: 0.55,
    });
    const m = new THREE.Mesh(geom, mat);
    m.position.x = -W / 2 + (i + 0.5) * (W / size);
    bars.push(m);
    group.add(m);
  }

  const heightOf = (v: number) => (v / size) * maxH + 0.25;
  const place = (i: number) => {
    const h = heightOf(cur[i]);
    bars[i].scale.y = h;
    bars[i].position.y = baseY + h / 2;
  };
  for (let i = 0; i < size; i++) place(i);

  const sorted = new Set<number>();
  let prev: number[] = [];
  let stepIdx = 0;
  let acc = 0;
  let finishedAt = -1;

  const colorOf = (i: number) => (sorted.has(i) ? SORT_GREEN : SORT_SLATE);
  const setColor = (i: number, hex: number) => {
    (bars[i].material as THREE.MeshStandardMaterial).color.setHex(hex);
  };

  const applyOp = (op: SortOp) => {
    for (const k of prev) setColor(k, colorOf(k));
    prev = [];
    if (op.t === "cmp") {
      setColor(op.i, SORT_AMBER);
      setColor(op.j!, SORT_AMBER);
      prev = [op.i, op.j!];
    } else if (op.t === "swap") {
      const t = cur[op.i];
      cur[op.i] = cur[op.j!];
      cur[op.j!] = t;
      place(op.i);
      place(op.j!);
      setColor(op.i, SORT_AMBER);
      setColor(op.j!, SORT_AMBER);
      prev = [op.i, op.j!];
    } else {
      sorted.add(op.i);
      setColor(op.i, SORT_GREEN);
    }
  };

  const restart = () => {
    cur = shuffle(size);
    ops = buildSortTrace(cur, algo);
    sorted.clear();
    prev = [];
    stepIdx = 0;
    acc = 0;
    finishedAt = -1;
    for (let i = 0; i < size; i++) {
      place(i);
      setColor(i, SORT_SLATE);
    }
  };

  return (elapsed, delta) => {
    if (!bool(params, "animate", true)) return;
    if (stepIdx >= ops.length) {
      if (finishedAt < 0) finishedAt = elapsed;
      else if (elapsed - finishedAt > 1.8) restart();
      return;
    }
    const speed = num(params, "speed", 1.5);
    acc += Math.min(delta, 0.05) * speed * 14;
    let guard = 0;
    while (acc >= 1 && stepIdx < ops.length && guard < 300) {
      applyOp(ops[stepIdx++]);
      acc -= 1;
      guard++;
    }
  };
};

export function sortingReadouts(p: ParamValues) {
  const algo = str(p, "algo", "bubble");
  const size = clampInt(num(p, "size", 16), 6, 40);
  const info = SORT_ALGOS[algo] ?? SORT_ALGOS.bubble;
  const est = info.quad ? (size * size) / 2 : size * Math.log2(Math.max(2, size));
  return [
    { label: "Algorithm", value: info.label },
    { label: "Array size", value: `${size}` },
    { label: "Avg comparisons", value: `≈ ${Math.round(est)}` },
    { label: "Complexity", value: info.quad ? "O(n²)" : "O(n log n)" },
  ];
}

export function sortingChart(p: ParamValues): LabChartData {
  const algo = str(p, "algo", "bubble");
  const size = clampInt(num(p, "size", 16), 6, 40);
  const info = SORT_ALGOS[algo] ?? SORT_ALGOS.bubble;
  const isQuad = info.quad;
  const quad: [number, number][] = [];
  const nlogn: [number, number][] = [];
  for (let n = 4; n <= 40; n += 2) {
    quad.push([n, (n * n) / 2]);
    nlogn.push([n, n * Math.log2(n)]);
  }
  const chosen = isQuad ? (size * size) / 2 : size * Math.log2(size);
  return {
    title: "Comparisons vs input size n",
    xLabel: "array size n",
    yLabel: "comparisons",
    series: [
      {
        points: quad,
        color: isQuad ? "accent" : "muted",
        dashed: !isQuad,
        area: isQuad,
        label: "O(n²)",
      },
      {
        points: nlogn,
        color: !isQuad ? "accent" : "muted",
        dashed: isQuad,
        area: !isQuad,
        label: "O(n log n)",
      },
    ],
    markers: [{ x: size, y: chosen, color: "accent" }],
    xDomain: [4, 40],
    note: `${info.label} is ${isQuad ? "O(n²)" : "O(n log n)"} — the marked point is its cost at n = ${size}.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   CHEMISTRY — ball-and-stick molecule viewer + composition chart
   ════════════════════════════════════════════════════════════════ */
type Atom = { el: string; p: [number, number, number] };
type Molecule = { name: string; formula: string; atoms: Atom[]; bonds: [number, number][] };

const ELEMENTS: Record<string, { color: number; r: number; vdw: number; m: number }> = {
  H: { color: 0xeaecf2, r: 0.3, vdw: 0.62, m: 1.008 },
  C: { color: 0x67718a, r: 0.46, vdw: 0.95, m: 12.011 },
  N: { color: 0x5a78ff, r: 0.43, vdw: 0.9, m: 14.007 },
  O: { color: 0xff5a5a, r: 0.41, vdw: 0.86, m: 15.999 },
};

const MOLECULES: Record<string, Molecule> = {
  water: {
    name: "Water",
    formula: "H₂O",
    atoms: [
      { el: "O", p: [0, 0, 0] },
      { el: "H", p: [0.757, 0.586, 0] },
      { el: "H", p: [-0.757, 0.586, 0] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  methane: {
    name: "Methane",
    formula: "CH₄",
    atoms: [
      { el: "C", p: [0, 0, 0] },
      { el: "H", p: [0.629, 0.629, 0.629] },
      { el: "H", p: [-0.629, -0.629, 0.629] },
      { el: "H", p: [-0.629, 0.629, -0.629] },
      { el: "H", p: [0.629, -0.629, -0.629] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  ammonia: {
    name: "Ammonia",
    formula: "NH₃",
    atoms: [
      { el: "N", p: [0, 0, 0] },
      { el: "H", p: [0.94, -0.27, 0] },
      { el: "H", p: [-0.47, -0.27, 0.814] },
      { el: "H", p: [-0.47, -0.27, -0.814] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  co2: {
    name: "Carbon dioxide",
    formula: "CO₂",
    atoms: [
      { el: "C", p: [0, 0, 0] },
      { el: "O", p: [1.16, 0, 0] },
      { el: "O", p: [-1.16, 0, 0] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  benzene: {
    name: "Benzene",
    formula: "C₆H₆",
    atoms: [
      { el: "C", p: [1.39, 0, 0] },
      { el: "C", p: [0.695, 1.204, 0] },
      { el: "C", p: [-0.695, 1.204, 0] },
      { el: "C", p: [-1.39, 0, 0] },
      { el: "C", p: [-0.695, -1.204, 0] },
      { el: "C", p: [0.695, -1.204, 0] },
      { el: "H", p: [2.49, 0, 0] },
      { el: "H", p: [1.245, 2.157, 0] },
      { el: "H", p: [-1.245, 2.157, 0] },
      { el: "H", p: [-2.49, 0, 0] },
      { el: "H", p: [-1.245, -2.157, 0] },
      { el: "H", p: [1.245, -2.157, 0] },
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [0, 6],
      [1, 7],
      [2, 8],
      [3, 9],
      [4, 10],
      [5, 11],
    ],
  },
};

function elementCounts(mol: Molecule): Record<string, number> {
  const c: Record<string, number> = {};
  for (const a of mol.atoms) c[a.el] = (c[a.el] || 0) + 1;
  return c;
}

export const moleculeScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 7.5);
  addStudioLights(group);

  const mol = MOLECULES[str(params, "molecule", "water")] ?? MOLECULES.water;
  const spaceFill = str(params, "style", "ball") === "space";
  const S = 1.7;

  const cx = mol.atoms.reduce((s, a) => s + a.p[0], 0) / mol.atoms.length;
  const cy = mol.atoms.reduce((s, a) => s + a.p[1], 0) / mol.atoms.length;
  const cz = mol.atoms.reduce((s, a) => s + a.p[2], 0) / mol.atoms.length;
  const pos = (a: Atom) =>
    new THREE.Vector3((a.p[0] - cx) * S, (a.p[1] - cy) * S, (a.p[2] - cz) * S);

  for (const a of mol.atoms) {
    const e = ELEMENTS[a.el] ?? ELEMENTS.C;
    const r = spaceFill ? e.vdw * 1.05 : e.r;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, 36, 28),
      new THREE.MeshStandardMaterial({ color: e.color, metalness: 0.15, roughness: 0.28 }),
    );
    mesh.position.copy(pos(a));
    group.add(mesh);
  }

  if (!spaceFill) {
    const up = new THREE.Vector3(0, 1, 0);
    const bondMat = new THREE.MeshStandardMaterial({
      color: 0x9aa3b4,
      metalness: 0.4,
      roughness: 0.4,
    });
    for (const [i, j] of mol.bonds) {
      const a = pos(mol.atoms[i]);
      const b = pos(mol.atoms[j]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len, 18), bondMat);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      group.add(mesh);
    }
  }
};

export function moleculeReadouts(p: ParamValues) {
  const mol = MOLECULES[str(p, "molecule", "water")] ?? MOLECULES.water;
  const counts = elementCounts(mol);
  const mass = Object.entries(counts).reduce((s, [el, n]) => s + (ELEMENTS[el]?.m ?? 0) * n, 0);
  return [
    { label: "Molecule", value: mol.name },
    { label: "Formula", value: mol.formula },
    { label: "Atoms", value: `${mol.atoms.length}` },
    { label: "Molar mass", value: `${mass.toFixed(2)} g/mol` },
  ];
}

export function moleculeChart(p: ParamValues): LabChartData {
  const mol = MOLECULES[str(p, "molecule", "water")] ?? MOLECULES.water;
  const counts = elementCounts(mol);
  const els = Object.keys(counts);
  return {
    title: "Atomic composition",
    kind: "bars",
    yLabel: "atoms",
    categories: els,
    series: [{ points: els.map((e, i) => [i, counts[e]] as [number, number]), color: "accent" }],
    note: `${mol.formula} — ${mol.atoms.length} atoms, ${mol.bonds.length} bonds.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   MATH — linear transformation: a grid + basis vectors morphed by a
   live 2×2 matrix, with the unit square mapped to a parallelogram.
   ════════════════════════════════════════════════════════════════ */
export const matrixScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9);

  const G = 5;
  const segs: [number, number, number, number][] = [];
  for (let k = -G; k <= G; k++) {
    segs.push([k, -G, k, G]);
    segs.push([-G, k, G, k]);
  }
  const pos = new Float32Array(segs.length * 2 * 3);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const grid = new THREE.LineSegments(
    gridGeo,
    new THREE.LineBasicMaterial({ color: 0x46506c, transparent: true, opacity: 0.65 }),
  );
  group.add(grid);

  const iArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    1,
    AMBER,
    0.35,
    0.22,
  );
  const jArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    1,
    INDIGO,
    0.35,
    0.22,
  );
  group.add(iArrow, jArrow);

  const sqGeo = new THREE.BufferGeometry();
  const sqPos = new Float32Array(5 * 3);
  sqGeo.setAttribute("position", new THREE.BufferAttribute(sqPos, 3));
  const sq = new THREE.Line(sqGeo, new THREE.LineBasicMaterial({ color: AMBER_LIGHT }));
  group.add(sq);

  return (elapsed) => {
    const a = num(params, "a", 1),
      b = num(params, "b", 0.5),
      c = num(params, "c", 0),
      d = num(params, "d", 1);
    const morph = bool(params, "animate", true);
    const t = morph ? Math.sin(elapsed * 0.9) * 0.5 + 0.5 : 1;
    const A = 1 + (a - 1) * t,
      B = b * t,
      C = c * t,
      D = 1 + (d - 1) * t;

    for (let s = 0; s < segs.length; s++) {
      const [x0, y0, x1, y1] = segs[s];
      const o = s * 6;
      pos[o] = A * x0 + B * y0;
      pos[o + 1] = C * x0 + D * y0;
      pos[o + 2] = 0;
      pos[o + 3] = A * x1 + B * y1;
      pos[o + 4] = C * x1 + D * y1;
      pos[o + 5] = 0;
    }
    (gridGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    const il = Math.hypot(A, C) || 1e-3;
    iArrow.setDirection(new THREE.Vector3(A, C, 0).normalize());
    iArrow.setLength(il, Math.min(0.35, il * 0.3), 0.22);
    const jl = Math.hypot(B, D) || 1e-3;
    jArrow.setDirection(new THREE.Vector3(B, D, 0).normalize());
    jArrow.setLength(jl, Math.min(0.35, jl * 0.3), 0.22);

    const corners = [
      [0, 0],
      [A, C],
      [A + B, C + D],
      [B, D],
      [0, 0],
    ];
    for (let i = 0; i < 5; i++) {
      sqPos[i * 3] = corners[i][0];
      sqPos[i * 3 + 1] = corners[i][1];
      sqPos[i * 3 + 2] = 0.01;
    }
    (sqGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
};

export function matrixReadouts(p: ParamValues) {
  const a = num(p, "a", 1),
    b = num(p, "b", 0.5),
    c = num(p, "c", 0),
    d = num(p, "d", 1);
  const det = a * d - b * c;
  return [
    {
      label: "Matrix",
      value: `[${a.toFixed(1)} ${b.toFixed(1)}; ${c.toFixed(1)} ${d.toFixed(1)}]`,
    },
    { label: "Determinant", value: det.toFixed(2) },
    { label: "Area scale", value: `×${Math.abs(det).toFixed(2)}` },
    { label: "Orientation", value: det < 0 ? "flipped" : det === 0 ? "collapsed" : "preserved" },
  ];
}

export function matrixChart(p: ParamValues): LabChartData {
  const a = num(p, "a", 1),
    b = num(p, "b", 0.5),
    c = num(p, "c", 0),
    d = num(p, "d", 1);
  const ref: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ];
  const tr: [number, number][] = [
    [0, 0],
    [a, c],
    [a + b, c + d],
    [b, d],
    [0, 0],
  ];
  const all = [...ref, ...tr];
  const lo = Math.min(-0.2, ...all.map((q) => q[0]), ...all.map((q) => q[1])) - 0.3;
  const hi = Math.max(1.2, ...all.map((q) => q[0]), ...all.map((q) => q[1])) + 0.3;
  return {
    title: "Unit square → parallelogram",
    xLabel: "x",
    yLabel: "y",
    series: [
      { points: ref, color: "muted", dashed: true, label: "unit square" },
      { points: tr, color: "accent", label: "transformed" },
    ],
    xDomain: [lo, hi],
    yDomain: [lo, hi],
    square: true,
    note: `det = ${(a * d - b * c).toFixed(2)} — the signed area of the parallelogram.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   BIOLOGY — a neuron with a travelling action-potential pulse, plus
   the classic membrane-voltage (action-potential) data overlay.
   ════════════════════════════════════════════════════════════════ */
export const neuronScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0.5, 13);
  addStudioLights(group);

  const nDend = clampInt(num(params, "dendrites", 5), 3, 8);
  const nMyelin = clampInt(num(params, "myelin", 5), 3, 8);
  const up = new THREE.Vector3(0, 1, 0);

  const somaMat = new THREE.MeshStandardMaterial({
    color: 0xe2a43b,
    metalness: 0.1,
    roughness: 0.5,
  });
  const dendMat = new THREE.MeshStandardMaterial({ color: 0xc98f3a, roughness: 0.6 });

  const soma = new THREE.Mesh(new THREE.SphereGeometry(1.0, 36, 28), somaMat);
  soma.position.set(-4.5, 0, 0);
  group.add(soma);
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a4e18, roughness: 0.6 }),
  );
  nucleus.position.copy(soma.position);
  group.add(nucleus);

  const addBranch = (from: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number) => {
    const to = from.clone().add(dir.clone().normalize().multiplyScalar(len));
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.6, rad, len, 10), dendMat);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(up, to.clone().sub(from).normalize());
    group.add(mesh);
    return to;
  };

  for (let i = 0; i < nDend; i++) {
    const theta = (i / nDend) * Math.PI * 2;
    const dir = new THREE.Vector3(-1.3, Math.cos(theta) * 0.95, Math.sin(theta) * 0.95);
    const base = soma.position.clone().add(dir.clone().normalize().multiplyScalar(0.85));
    const tip = addBranch(base, dir, 1.7, 0.12);
    const jitter = new THREE.Vector3(
      -0.4,
      Math.cos(theta * 1.7) * 0.7,
      Math.sin(theta * 1.3) * 0.7,
    );
    addBranch(tip, dir.clone().add(jitter), 0.95, 0.07);
  }

  const axonStartX = -3.5;
  const axonLen = 7;
  const axon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, axonLen, 16),
    new THREE.MeshStandardMaterial({ color: 0xb98a4a, roughness: 0.55 }),
  );
  axon.rotation.z = Math.PI / 2;
  axon.position.set(axonStartX + axonLen / 2, 0, 0);
  group.add(axon);

  const myMat = new THREE.MeshStandardMaterial({ color: 0xdfe6ef, metalness: 0.1, roughness: 0.4 });
  const segLen = (axonLen / nMyelin) * 0.7;
  for (let s = 0; s < nMyelin; s++) {
    const cx = axonStartX + (s + 0.5) * (axonLen / nMyelin);
    const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, segLen, 16), myMat);
    sheath.rotation.z = Math.PI / 2;
    sheath.position.set(cx, 0, 0);
    group.add(sheath);
  }

  const termBase = new THREE.Vector3(axonStartX + axonLen, 0, 0);
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI * 2;
    const dir = new THREE.Vector3(1.1, Math.cos(theta) * 0.7, Math.sin(theta) * 0.7);
    const tip = addBranch(termBase, dir, 1.0, 0.08);
    const bouton = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), somaMat);
    bouton.position.copy(tip);
    group.add(bouton);
  }

  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x6ec1ff }),
  );
  group.add(pulse);

  return (elapsed) => {
    if (!bool(params, "animate", true)) {
      pulse.visible = false;
      return;
    }
    pulse.visible = true;
    const u = (elapsed % 2.2) / 2.2;
    pulse.position.set(axonStartX + u * axonLen, 0, 0);
    pulse.scale.setScalar(1 + Math.sin(u * Math.PI) * 0.4);
  };
};

export function neuronReadouts(p: ParamValues) {
  return [
    { label: "Resting potential", value: "−70 mV" },
    { label: "Threshold", value: "−55 mV" },
    { label: "Peak", value: "+40 mV" },
    { label: "Dendrites", value: `${clampInt(num(p, "dendrites", 5), 3, 8)}` },
  ];
}

export function neuronChart(_p: ParamValues): LabChartData {
  const keys: [number, number][] = [
    [0, -70],
    [1, -68],
    [1.3, -55],
    [1.7, 0],
    [2.0, 40],
    [2.4, 10],
    [2.9, -55],
    [3.4, -80],
    [4.2, -78],
    [5.2, -71],
    [6, -70],
  ];
  const pts: [number, number][] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    for (let s = 0; s < 12; s++) {
      const f = s / 12;
      pts.push([t0 + (t1 - t0) * f, v0 + (v1 - v0) * f]);
    }
  }
  pts.push(keys[keys.length - 1]);
  return {
    title: "Action potential",
    xLabel: "time (ms)",
    yLabel: "mV",
    series: [{ points: pts, color: "accent", area: true }],
    xDomain: [0, 6],
    yDomain: [-90, 55],
    zeroLine: true,
    markers: [{ x: 2.0, y: 40, color: "accent" }],
    note: "Resting −70 mV → spike to +40 mV → repolarise, with a brief hyperpolarised dip.",
  };
}

/* ════════════════════════════════════════════════════════════════
   MATH — calculus: drag a point along a curve to see the tangent
   (the derivative) and the shaded area under it (the integral). The
   3D stage and the chart read the same x₀, so they stay in lock-step.
   ════════════════════════════════════════════════════════════════ */
const CALC_FNS: Record<
  string,
  { f: (x: number) => number; df: (x: number) => number; label: string }
> = {
  parabola: { f: (x) => 0.4 * x * x - 1, df: (x) => 0.8 * x, label: "0.4x² − 1" },
  sine: {
    f: (x) => 1.6 * Math.sin(1.2 * x),
    df: (x) => 1.92 * Math.cos(1.2 * x),
    label: "1.6·sin(1.2x)",
  },
  cubic: {
    f: (x) => 0.18 * x * x * x - 0.6 * x,
    df: (x) => 0.54 * x * x - 0.6,
    label: "0.18x³ − 0.6x",
  },
  gaussian: {
    f: (x) => 2.2 * Math.exp((-x * x) / 1.5) - 1,
    df: (x) => ((2.2 * (-2 * x)) / 1.5) * Math.exp((-x * x) / 1.5),
    label: "2.2·e^(−x²/1.5) − 1",
  },
};

function calcIntegral(fnKey: string, x0: number) {
  const f = (CALC_FNS[fnKey] ?? CALC_FNS.parabola).f;
  const a = -3;
  const steps = 240;
  const h = (x0 - a) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) sum += f(a + (i + 0.5) * h) * h;
  return sum;
}

export const calculusScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9);
  group.add(new THREE.AmbientLight(0xffffff, 0.9));

  const fn = CALC_FNS[str(params, "fn", "parabola")] ?? CALC_FNS.parabola;

  const axes = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.4, 0, 0),
      new THREE.Vector3(3.4, 0, 0),
      new THREE.Vector3(0, -3, 0),
      new THREE.Vector3(0, 3, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0x46506c }),
  );
  group.add(axes);

  const curvePts: THREE.Vector3[] = [];
  for (let x = -3; x <= 3.001; x += 0.06) curvePts.push(new THREE.Vector3(x, fn.f(x), 0));
  const curve = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curvePts),
    new THREE.LineBasicMaterial({ color: AMBER }),
  );
  group.add(curve);

  const NB = 48;
  const barW = 6 / NB;
  const bars: THREE.Mesh[] = [];
  const barMat = new THREE.MeshBasicMaterial({
    color: 0xe2a43b,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < NB; i++) {
    const cx = -3 + (i + 0.5) * barW;
    const h = fn.f(cx);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(barW * 0.92, Math.abs(h) || 0.001), barMat);
    m.position.set(cx, h / 2, -0.01);
    m.userData.cx = cx;
    bars.push(m);
    group.add(m);
  }

  const point = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x6ec1ff }),
  );
  group.add(point);

  const tangent = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(1, 0, 0),
    ]),
    new THREE.LineBasicMaterial({ color: INDIGO }),
  );
  group.add(tangent);

  return () => {
    const mode = str(params, "mode", "derivative");
    const x0 = Math.max(-3, Math.min(3, num(params, "x0", 1)));
    const y0 = fn.f(x0);
    const slope = fn.df(x0);
    point.position.set(x0, y0, 0.03);

    const dx = 1.2;
    const tp = tangent.geometry.attributes.position as THREE.BufferAttribute;
    tp.setXYZ(0, x0 - dx, y0 - slope * dx, 0.02);
    tp.setXYZ(1, x0 + dx, y0 + slope * dx, 0.02);
    tp.needsUpdate = true;
    tangent.visible = mode === "derivative";

    for (const b of bars) b.visible = mode === "integral" && (b.userData.cx as number) <= x0;
  };
};

export function calculusReadouts(p: ParamValues) {
  const fnKey = str(p, "fn", "parabola");
  const fn = CALC_FNS[fnKey] ?? CALC_FNS.parabola;
  const x0 = num(p, "x0", 1);
  return [
    { label: "f(x)", value: fn.label },
    { label: "f(x₀)", value: fn.f(x0).toFixed(2) },
    { label: "Slope f′(x₀)", value: fn.df(x0).toFixed(2) },
    { label: "∫ area (−3→x₀)", value: calcIntegral(fnKey, x0).toFixed(2) },
  ];
}

export function calculusChart(p: ParamValues): LabChartData {
  const fnKey = str(p, "fn", "parabola");
  const fn = CALC_FNS[fnKey] ?? CALC_FNS.parabola;
  const x0 = Math.max(-3, Math.min(3, num(p, "x0", 1)));
  const mode = str(p, "mode", "derivative");

  const curve: [number, number][] = [];
  for (let x = -3; x <= 3.001; x += 0.06) curve.push([x, fn.f(x)]);
  const series: LabChartData["series"] = [{ points: curve, color: "accent", label: "f(x)" }];

  if (mode === "integral") {
    const area: [number, number][] = [];
    for (let x = -3; x <= x0 + 0.0001; x += 0.06) area.push([x, fn.f(x)]);
    if (area.length > 1)
      series.push({ points: area, color: "accent", area: true, noLine: true, label: "∫ area" });
  } else {
    const y0 = fn.f(x0);
    const s = fn.df(x0);
    const dx = 1.4;
    series.push({
      points: [
        [x0 - dx, y0 - s * dx],
        [x0 + dx, y0 + s * dx],
      ],
      color: "violet",
      dashed: true,
      label: "tangent",
    });
  }

  return {
    title: mode === "integral" ? "Area under the curve" : "Tangent line — the derivative",
    xLabel: "x",
    yLabel: "y",
    series,
    xDomain: [-3, 3],
    zeroLine: true,
    markers: [{ x: x0, y: fn.f(x0), color: "accent" }],
    note:
      mode === "integral"
        ? `∫ from −3 to ${x0.toFixed(1)} ≈ ${calcIntegral(fnKey, x0).toFixed(2)} (the shaded area).`
        : `Slope at x = ${x0.toFixed(1)} is f′ = ${fn.df(x0).toFixed(2)}.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   SHARED HELPERS for the expansion scenes below. Geometry + colour
   only (no text textures) so the engine's traverse-and-dispose
   teardown reclaims everything, exactly like the existing scenes.
   ════════════════════════════════════════════════════════════════ */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** A static line through the given points. */
function line2(pts: THREE.Vector3[], color: number) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color }),
  );
}

/** A reusable polyline with `n` updatable vertices (no per-frame allocation). */
function polyLine(n: number, color: number) {
  const pts = Array.from({ length: n }, () => new THREE.Vector3());
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color }),
  );
}

/** Update a polyline's vertices in place. */
function setPts(line: THREE.Line, ...pts: THREE.Vector3[]) {
  const a = line.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pts.length; i++) a.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
  a.needsUpdate = true;
}

/** A small unlit marker sphere. */
function dotMesh(color: number, r = 0.1) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 14, 10),
    new THREE.MeshBasicMaterial({ color }),
  );
}

/** A simple flat box used by the data-structure scenes. */
function cellBox(w: number, h: number, color: number, opacity = 1) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.3),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 0.1,
      transparent: opacity < 1,
      opacity,
    }),
  );
}

/** An arrow (shaft line + cone head) that can be repositioned each frame. */
function makeArrow(color: number) {
  const group = new THREE.Group();
  const shaft = polyLine(2, color);
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.32, 14),
    new THREE.MeshBasicMaterial({ color }),
  );
  group.add(shaft);
  group.add(head);
  return {
    group,
    /** Draw a vertical arrow from (x, 0) to (x, y). */
    set(x: number, y: number) {
      setPts(
        shaft,
        new THREE.Vector3(x, 0, 0.01),
        new THREE.Vector3(x, y - Math.sign(y) * 0.16, 0.01),
      );
      head.position.set(x, y, 0.01);
      head.rotation.z = y >= 0 ? 0 : Math.PI;
    },
  };
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Projectile motion (parabolic trajectory)
   ════════════════════════════════════════════════════════════════ */
const PROJ_ORIGIN_X = -4.2;
const PROJ_GROUND_Y = -2.6;

function projectileFit(v: number, angle: number, g: number) {
  const T = (2 * v * Math.sin(angle)) / g || 0.001;
  const R = (v * v * Math.sin(2 * angle)) / g;
  const H = (v * v * Math.sin(angle) ** 2) / (2 * g);
  const scale = 7.6 / Math.max(R, 2 * H, 5);
  return { T, R, H, scale };
}

export const projectileScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9);
  group.add(new THREE.AmbientLight(0xffffff, 0.95));

  // ground line + vertical axis
  group.add(
    line2(
      [
        new THREE.Vector3(PROJ_ORIGIN_X, PROJ_GROUND_Y, 0),
        new THREE.Vector3(4.4, PROJ_GROUND_Y, 0),
      ],
      0x46506c,
    ),
  );
  group.add(
    line2(
      [new THREE.Vector3(PROJ_ORIGIN_X, PROJ_GROUND_Y, 0), new THREE.Vector3(PROJ_ORIGIN_X, 3, 0)],
      0x46506c,
    ),
  );

  const N = 80;
  const traj = polyLine(N, 0xe2a43b);
  group.add(traj);

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 22, 16),
    new THREE.MeshStandardMaterial({ color: AMBER_LIGHT, emissive: 0x5a3d12, roughness: 0.4 }),
  );
  group.add(ball);
  addStudioLights(group);

  const apexMark = dotMesh(INDIGO, 0.1);
  group.add(apexMark);

  return (elapsed) => {
    const v = num(params, "speed", 20);
    const angle = (num(params, "angle", 45) * Math.PI) / 180;
    const g = Math.max(1, num(params, "gravity", 9.8));
    const animate = bool(params, "animate", true);
    const { T, R, H, scale } = projectileFit(v, angle, g);

    const a = traj.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * T;
      const x = v * Math.cos(angle) * t;
      const y = v * Math.sin(angle) * t - 0.5 * g * t * t;
      a.setXYZ(i, PROJ_ORIGIN_X + x * scale, PROJ_GROUND_Y + Math.max(0, y) * scale, 0);
    }
    a.needsUpdate = true;

    const phase = animate ? (elapsed % (T + 0.4)) / T : 0.9999;
    const tb = Math.min(phase, 1) * T;
    const bx = v * Math.cos(angle) * tb;
    const by = Math.max(0, v * Math.sin(angle) * tb - 0.5 * g * tb * tb);
    ball.position.set(PROJ_ORIGIN_X + bx * scale, PROJ_GROUND_Y + by * scale, 0.05);
    apexMark.position.set(PROJ_ORIGIN_X + (R / 2) * scale, PROJ_GROUND_Y + H * scale, 0.05);
  };
};

export function projectileReadouts(p: ParamValues) {
  const v = num(p, "speed", 20);
  const angle = (num(p, "angle", 45) * Math.PI) / 180;
  const g = Math.max(1, num(p, "gravity", 9.8));
  const { T, R, H } = projectileFit(v, angle, g);
  return [
    { label: "Range", value: `${R.toFixed(1)} m` },
    { label: "Max height", value: `${H.toFixed(1)} m` },
    { label: "Flight time", value: `${T.toFixed(2)} s` },
    { label: "Launch angle", value: `${num(p, "angle", 45).toFixed(0)}°` },
  ];
}

export function projectileChart(p: ParamValues): LabChartData {
  const v = num(p, "speed", 20);
  const angle = (num(p, "angle", 45) * Math.PI) / 180;
  const g = Math.max(1, num(p, "gravity", 9.8));
  const { T, R, H } = projectileFit(v, angle, g);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * T;
    const x = v * Math.cos(angle) * t;
    const y = v * Math.sin(angle) * t - 0.5 * g * t * t;
    pts.push([x, Math.max(0, y)]);
  }
  return {
    title: "Trajectory — height vs distance",
    xLabel: "distance (m)",
    yLabel: "height (m)",
    series: [{ points: pts, color: "accent", area: true }],
    markers: [{ x: R / 2, y: H, color: "violet", label: "apex" }],
    note: `Peak ${H.toFixed(1)} m at ${(R / 2).toFixed(1)} m; lands at ${R.toFixed(1)} m. Max range is at 45°.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Bohr atom model (nucleus + electron shells)
   ════════════════════════════════════════════════════════════════ */
const ATOM_ELEMENTS: Record<
  string,
  { name: string; symbol: string; z: number; n: number; shells: number[] }
> = {
  H: { name: "Hydrogen", symbol: "H", z: 1, n: 0, shells: [1] },
  He: { name: "Helium", symbol: "He", z: 2, n: 2, shells: [2] },
  Li: { name: "Lithium", symbol: "Li", z: 3, n: 4, shells: [2, 1] },
  C: { name: "Carbon", symbol: "C", z: 6, n: 6, shells: [2, 4] },
  O: { name: "Oxygen", symbol: "O", z: 8, n: 8, shells: [2, 6] },
  Ne: { name: "Neon", symbol: "Ne", z: 10, n: 10, shells: [2, 8] },
  Na: { name: "Sodium", symbol: "Na", z: 11, n: 12, shells: [2, 8, 1] },
  Si: { name: "Silicon", symbol: "Si", z: 14, n: 14, shells: [2, 8, 4] },
  Ar: { name: "Argon", symbol: "Ar", z: 18, n: 22, shells: [2, 8, 8] },
};

export const atomScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 10);
  addStudioLights(group);
  const el = ATOM_ELEMENTS[str(params, "element", "C")] ?? ATOM_ELEMENTS.C;

  // nucleus: protons (red) + neutrons (grey) packed on a golden spiral
  const nucleus = new THREE.Group();
  const total = el.z + el.n;
  const protonMat = new THREE.MeshStandardMaterial({ color: 0xff5a5a, roughness: 0.45 });
  const neutronMat = new THREE.MeshStandardMaterial({ color: 0x9aa3b4, roughness: 0.55 });
  const packR = 0.22 + 0.18 * Math.cbrt(Math.max(1, total));
  for (let i = 0; i < total; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 16, 12),
      i < el.z ? protonMat : neutronMat,
    );
    const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(total, 1));
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const rr = total === 1 ? 0 : packR;
    m.position.set(
      rr * Math.sin(phi) * Math.cos(theta),
      rr * Math.sin(phi) * Math.sin(theta),
      rr * Math.cos(phi),
    );
    nucleus.add(m);
  }
  group.add(nucleus);

  const pivots: { pivot: THREE.Group; speed: number }[] = [];
  el.shells.forEach((count, si) => {
    const radius = 1.35 + si * 0.95;
    const ringPts: THREE.Vector3[] = [];
    for (let aa = 0; aa <= 72; aa++) {
      const t = (aa / 72) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
    }
    const ring = line2(ringPts, 0x46506c);
    ring.rotation.x = 1.05;
    group.add(ring);

    const pivot = new THREE.Group();
    pivot.rotation.x = 1.05;
    for (let e = 0; e < count; e++) {
      const t = (e / count) * Math.PI * 2;
      const elec = dotMesh(0x6ec1ff, 0.13);
      elec.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
      pivot.add(elec);
    }
    group.add(pivot);
    pivots.push({ pivot, speed: 0.95 - si * 0.2 });
  });

  return (_elapsed, delta) => {
    const animate = bool(params, "animate", true);
    if (animate) for (const p of pivots) p.pivot.rotation.z += delta * p.speed;
    nucleus.rotation.y += delta * 0.3;
  };
};

export function atomReadouts(p: ParamValues) {
  const el = ATOM_ELEMENTS[str(p, "element", "C")] ?? ATOM_ELEMENTS.C;
  const electrons = el.shells.reduce((s, n) => s + n, 0);
  return [
    { label: "Element", value: `${el.name} (${el.symbol})` },
    { label: "Protons (Z)", value: `${el.z}` },
    { label: "Neutrons", value: `${el.n}` },
    { label: "Electrons", value: `${electrons}` },
    { label: "Shells", value: el.shells.join(", ") },
    { label: "Mass number", value: `${el.z + el.n}` },
  ];
}

export function atomChart(p: ParamValues): LabChartData {
  const el = ATOM_ELEMENTS[str(p, "element", "C")] ?? ATOM_ELEMENTS.C;
  return {
    title: "Electrons per shell",
    kind: "bars",
    yLabel: "electrons",
    categories: el.shells.map((_, i) => `n=${i + 1}`),
    series: [{ points: el.shells.map((c, i) => [i, c] as [number, number]), color: "accent" }],
    note: `${el.name}: capacity rule 2n² → shells fill 2, 8, 18… Valence shell holds ${el.shells[el.shells.length - 1]}.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS — Thin lens (ray diagram, converging & diverging)
   1/f = 1/v + 1/u  (real-positive convention)
   ════════════════════════════════════════════════════════════════ */
const OPTICS_SC = 0.7; // world units per "metre"
const OPTICS_HOBJ = 1.6;

function lensSolve(p: ParamValues) {
  const convex = str(p, "lens", "convex") === "convex";
  const f = (convex ? 1 : -1) * Math.max(0.3, num(p, "focal", 2));
  const u = Math.max(0.4, num(p, "objDist", 4));
  const di = 1 / (1 / f - 1 / u); // >0 real (right) · <0 virtual (left)
  const m = -di / u;
  return { convex, f, u, di, m };
}

export const opticsScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 11);
  group.add(new THREE.AmbientLight(0xffffff, 0.95));

  group.add(line2([new THREE.Vector3(-6.5, 0, 0), new THREE.Vector3(6.5, 0, 0)], 0x46506c));

  // lens silhouette (rebuilds on lens type)
  const convex = str(params, "lens", "convex") === "convex";
  const lh = 2.4;
  const bulge = convex ? 0.55 : -0.55;
  const lensPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 26; i++) {
    const y = ((i / 26) * 2 - 1) * lh;
    lensPts.push(new THREE.Vector3(bulge * (1 - (y / lh) ** 2), y, 0));
  }
  for (let i = 0; i <= 26; i++) {
    const y = (1 - (i / 26) * 2) * lh;
    lensPts.push(new THREE.Vector3(-bulge * (1 - (y / lh) ** 2), y, 0));
  }
  group.add(line2(lensPts, 0x6ec1ff));

  const fNear = dotMesh(INDIGO, 0.09);
  const fFar = dotMesh(INDIGO, 0.09);
  group.add(fNear);
  group.add(fFar);

  const obj = makeArrow(AMBER);
  const img = makeArrow(0x6ec1ff);
  group.add(obj.group);
  group.add(img.group);

  const rayA = polyLine(3, 0xe2a43b); // parallel → focus
  const rayB = polyLine(3, 0xefc97e); // through centre
  const extA = polyLine(2, 0x4a5573); // virtual construction
  const extB = polyLine(2, 0x4a5573);
  group.add(rayA, rayB, extA, extB);

  return () => {
    const { f, u, di, m } = lensSolve(params);
    const hi = m * OPTICS_HOBJ;
    const tipX = -u * OPTICS_SC;
    const tipY = OPTICS_HOBJ * OPTICS_SC;
    const tip = new THREE.Vector3(tipX, tipY, 0.02);
    const aLens = new THREE.Vector3(0, tipY, 0.02);
    const centre = new THREE.Vector3(0, 0, 0.02);

    obj.set(tipX, tipY);
    img.set(di * OPTICS_SC, hi * OPTICS_SC);
    fNear.position.set(-Math.abs(f) * OPTICS_SC, 0, 0);
    fFar.position.set(Math.abs(f) * OPTICS_SC, 0, 0);

    // parallel ray: through (0, h), along the line through the focal point (+f, 0), travelling +x
    const dirA = new THREE.Vector3(0 - f * OPTICS_SC, tipY - 0, 0);
    if (dirA.x < 0) dirA.negate();
    dirA.normalize();
    setPts(rayA, tip, aLens, aLens.clone().add(dirA.multiplyScalar(13)));

    // central ray: straight through the optical centre
    const dirB = centre.clone().sub(tip).normalize();
    setPts(rayB, tip, centre, centre.clone().add(dirB.multiplyScalar(13)));

    const virtual = di < 0;
    extA.visible = virtual;
    extB.visible = virtual;
    if (virtual) {
      const vt = new THREE.Vector3(di * OPTICS_SC, hi * OPTICS_SC, 0.02);
      setPts(extA, aLens, vt);
      setPts(extB, centre, vt);
    }
  };
};

export function opticsReadouts(p: ParamValues) {
  const { convex, f, u, di, m } = lensSolve(p);
  const real = di > 0;
  return [
    { label: "Lens", value: `${convex ? "Converging" : "Diverging"} (f = ${f.toFixed(1)})` },
    { label: "Object distance", value: `${u.toFixed(1)}` },
    { label: "Image distance", value: `${di.toFixed(2)}` },
    { label: "Magnification", value: `${m.toFixed(2)}×` },
    { label: "Image", value: `${real ? "real" : "virtual"}, ${m < 0 ? "inverted" : "upright"}` },
  ];
}

export function opticsChart(p: ParamValues): LabChartData {
  const { f, u } = lensSolve(p);
  const di = 1 / (1 / f - 1 / u);
  const pts: [number, number][] = [];
  for (let uu = 0.4; uu <= 8.0001; uu += 0.1) {
    const v = 1 / (1 / f - 1 / uu);
    if (Math.abs(v) <= 12) pts.push([uu, v]);
  }
  return {
    title: "Lens equation — image vs object distance",
    xLabel: "object distance u",
    yLabel: "image distance v",
    series: [{ points: pts, color: "accent" }],
    markers: [{ x: u, y: clamp(di, -12, 12), color: "violet" }],
    zeroLine: true,
    note: `1/f = 1/v + 1/u. At u = f the image flies to infinity; inside f it turns virtual.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   MATH — Unit circle & trigonometry (sin/cos/tan projections)
   ════════════════════════════════════════════════════════════════ */
const TRIG_R = 2.2;

export const trigScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 8);
  group.add(new THREE.AmbientLight(0xffffff, 0.95));

  group.add(line2([new THREE.Vector3(-3.3, 0, 0), new THREE.Vector3(3.3, 0, 0)], 0x46506c));
  group.add(line2([new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)], 0x46506c));

  const circlePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * Math.PI * 2;
    circlePts.push(new THREE.Vector3(Math.cos(t) * TRIG_R, Math.sin(t) * TRIG_R, 0));
  }
  group.add(line2(circlePts, 0x6ec1ff));

  const radius = polyLine(2, 0xefc97e);
  const sinSeg = polyLine(2, 0xe2a43b); // vertical leg = sin
  const cosSeg = polyLine(2, 0x7a6bff); // horizontal leg = cos
  group.add(radius, sinSeg, cosSeg);
  const point = dotMesh(0xefc97e, 0.13);
  group.add(point);

  // The angle slider drives the scene directly, so readouts/chart stay in sync.
  return () => {
    const t = (num(params, "angle", 45) * Math.PI) / 180;
    const x = Math.cos(t) * TRIG_R;
    const y = Math.sin(t) * TRIG_R;
    setPts(radius, new THREE.Vector3(0, 0, 0.01), new THREE.Vector3(x, y, 0.01));
    setPts(sinSeg, new THREE.Vector3(x, 0, 0.02), new THREE.Vector3(x, y, 0.02));
    setPts(cosSeg, new THREE.Vector3(0, 0, 0.03), new THREE.Vector3(x, 0, 0.03));
    point.position.set(x, y, 0.04);
  };
};

export function trigReadouts(p: ParamValues) {
  const deg = num(p, "angle", 45);
  const t = (deg * Math.PI) / 180;
  const tan = Math.abs(Math.cos(t)) < 1e-6 ? "∞" : Math.tan(t).toFixed(3);
  return [
    { label: "Angle", value: `${deg.toFixed(0)}°  (${t.toFixed(3)} rad)` },
    { label: "sin θ", value: Math.sin(t).toFixed(3) },
    { label: "cos θ", value: Math.cos(t).toFixed(3) },
    { label: "tan θ", value: tan },
  ];
}

export function trigChart(p: ParamValues): LabChartData {
  const deg = num(p, "angle", 45);
  const sinPts: [number, number][] = [];
  const cosPts: [number, number][] = [];
  for (let d = 0; d <= 360; d += 4) {
    const t = (d * Math.PI) / 180;
    sinPts.push([d, Math.sin(t)]);
    cosPts.push([d, Math.cos(t)]);
  }
  const t = (deg * Math.PI) / 180;
  return {
    title: "Sine & cosine vs angle",
    xLabel: "angle (°)",
    yLabel: "value",
    series: [
      { points: sinPts, color: "accent", label: "sin" },
      { points: cosPts, color: "violet", label: "cos" },
    ],
    xDomain: [0, 360],
    yDomain: [-1.1, 1.1],
    zeroLine: true,
    markers: [
      { x: deg, y: Math.sin(t), color: "accent" },
      { x: deg, y: Math.cos(t), color: "violet" },
    ],
    note: `At ${deg.toFixed(0)}°: sin = ${Math.sin(t).toFixed(2)}, cos = ${Math.cos(t).toFixed(2)}. sin²+cos² = 1 always.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   MATH — Platonic solids (Euler's formula V − E + F = 2)
   ════════════════════════════════════════════════════════════════ */
const SOLIDS: Record<
  string,
  { name: string; v: number; e: number; f: number; geo: () => THREE.BufferGeometry }
> = {
  tetra: { name: "Tetrahedron", v: 4, e: 6, f: 4, geo: () => new THREE.TetrahedronGeometry(1.8) },
  cube: { name: "Cube", v: 8, e: 12, f: 6, geo: () => new THREE.BoxGeometry(2.5, 2.5, 2.5) },
  octa: { name: "Octahedron", v: 6, e: 12, f: 8, geo: () => new THREE.OctahedronGeometry(1.95) },
  dodeca: {
    name: "Dodecahedron",
    v: 20,
    e: 30,
    f: 12,
    geo: () => new THREE.DodecahedronGeometry(1.75),
  },
  icosa: {
    name: "Icosahedron",
    v: 12,
    e: 30,
    f: 20,
    geo: () => new THREE.IcosahedronGeometry(1.85),
  },
};

export const solidsScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 7.5);
  addStudioLights(group);
  const s = SOLIDS[str(params, "solid", "cube")] ?? SOLIDS.cube;
  const geo = s.geo();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: 0x2a3550,
      metalness: 0.2,
      roughness: 0.35,
      transparent: true,
      opacity: 0.5,
      flatShading: true,
    }),
  );
  group.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xefc97e }),
  );
  group.add(edges);

  return (_elapsed, delta) => {
    if (bool(params, "animate", true)) {
      mesh.rotation.y += delta * 0.5;
      mesh.rotation.x += delta * 0.18;
      edges.rotation.copy(mesh.rotation);
    }
  };
};

export function solidsReadouts(p: ParamValues) {
  const s = SOLIDS[str(p, "solid", "cube")] ?? SOLIDS.cube;
  return [
    { label: "Solid", value: s.name },
    { label: "Vertices (V)", value: `${s.v}` },
    { label: "Edges (E)", value: `${s.e}` },
    { label: "Faces (F)", value: `${s.f}` },
    { label: "V − E + F", value: `${s.v - s.e + s.f}` },
  ];
}

export function solidsChart(p: ParamValues): LabChartData {
  const s = SOLIDS[str(p, "solid", "cube")] ?? SOLIDS.cube;
  return {
    title: "Vertices · Edges · Faces",
    kind: "bars",
    yLabel: "count",
    categories: ["V", "E", "F"],
    series: [
      {
        points: [
          [0, s.v],
          [1, s.e],
          [2, s.f],
        ],
        color: "accent",
      },
    ],
    note: `Euler's formula: V − E + F = ${s.v} − ${s.e} + ${s.f} = 2 for every convex polyhedron.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   CS — Stack & Queue (LIFO vs FIFO), animated push/pop demo
   ════════════════════════════════════════════════════════════════ */
const SQ_OPS: { push: boolean; val: number }[] = [
  { push: true, val: 3 },
  { push: true, val: 7 },
  { push: true, val: 1 },
  { push: true, val: 9 },
  { push: false, val: 0 },
  { push: true, val: 5 },
  { push: false, val: 0 },
  { push: false, val: 0 },
  { push: false, val: 0 },
  { push: false, val: 0 },
];

function sqState(isQueue: boolean, kRaw: number) {
  const kc = ((kRaw % SQ_OPS.length) + SQ_OPS.length) % SQ_OPS.length;
  const arr: number[] = [];
  for (let i = 0; i <= kc; i++) {
    const op = SQ_OPS[i];
    if (op.push) arr.push(op.val);
    else if (arr.length) {
      if (isQueue) arr.shift();
      else arr.pop();
    }
  }
  return arr;
}

export const stackQueueScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9);
  addStudioLights(group);
  const MAX = 6;
  const boxes = Array.from({ length: MAX }, () => {
    const b = cellBox(1.3, 0.72, 0x2a3550);
    group.add(b);
    return b;
  });

  let lastK = 0;
  return (elapsed) => {
    const isQueue = str(params, "mode", "stack") === "queue";
    const animate = bool(params, "animate", true);
    if (animate) lastK = Math.floor(elapsed / 0.9);
    const arr = sqState(isQueue, lastK);

    for (let i = 0; i < MAX; i++) {
      const b = boxes[i];
      const mat = b.material as THREE.MeshStandardMaterial;
      if (i >= arr.length) {
        b.visible = false;
        continue;
      }
      b.visible = true;
      if (isQueue) {
        const gap = 1.45;
        b.position.set(-((arr.length - 1) / 2) * gap + i * gap, 0, 0);
      } else {
        const gap = 0.82;
        b.position.set(0, -((arr.length - 1) / 2) * gap + i * gap, 0);
      }
      const active = isQueue ? i === 0 : i === arr.length - 1;
      mat.color.setHex(active ? 0x3fbf7f : 0x2a3550);
      mat.emissive.setHex(active ? 0x123524 : 0x000000);
    }
  };
};

export function stackQueueReadouts(p: ParamValues) {
  const isQueue = str(p, "mode", "stack") === "queue";
  return [
    { label: "Structure", value: isQueue ? "Queue" : "Stack" },
    { label: "Rule", value: isQueue ? "FIFO — first in, first out" : "LIFO — last in, first out" },
    { label: "Add", value: isQueue ? "enqueue (back) → O(1)" : "push (top) → O(1)" },
    { label: "Remove", value: isQueue ? "dequeue (front) → O(1)" : "pop (top) → O(1)" },
    { label: "Active end", value: isQueue ? "front (green)" : "top (green)" },
  ];
}

/* ════════════════════════════════════════════════════════════════
   CS — Singly linked list (nodes + next pointers), traversal sweep
   ════════════════════════════════════════════════════════════════ */
export const linkedListScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9.5);
  addStudioLights(group);
  const n = clampInt(num(params, "length", 5), 2, 7);
  const gap = 1.85;
  const x0 = -((n - 1) / 2) * gap;

  const nodes: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const b = cellBox(1.0, 0.92, 0x2a3550);
    b.position.set(x0 + i * gap, 0, 0);
    group.add(b);
    nodes.push(b);

    if (i < n - 1) {
      group.add(
        line2(
          [
            new THREE.Vector3(x0 + i * gap + 0.52, 0, 0),
            new THREE.Vector3(x0 + (i + 1) * gap - 0.52, 0, 0),
          ],
          0x6ec1ff,
        ),
      );
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.28, 12),
        new THREE.MeshBasicMaterial({ color: 0x6ec1ff }),
      );
      head.position.set(x0 + (i + 1) * gap - 0.56, 0, 0);
      head.rotation.z = -Math.PI / 2;
      group.add(head);
    }
  }
  // "head" pointer above the first node
  const headMark = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.34, 12),
    new THREE.MeshBasicMaterial({ color: 0xefc97e }),
  );
  headMark.position.set(x0, 0.95, 0);
  headMark.rotation.z = Math.PI;
  group.add(headMark);

  return (elapsed) => {
    const animate = bool(params, "animate", true);
    const cur = animate ? Math.floor(elapsed / 0.7) % n : 0;
    nodes.forEach((nd, i) => {
      const mat = nd.material as THREE.MeshStandardMaterial;
      mat.color.setHex(i === cur ? 0x3fbf7f : 0x2a3550);
      mat.emissive.setHex(i === cur ? 0x123524 : 0x000000);
    });
  };
};

export function linkedListReadouts(p: ParamValues) {
  const n = clampInt(num(p, "length", 5), 2, 7);
  return [
    { label: "Structure", value: "Singly linked list" },
    { label: "Nodes", value: `${n}` },
    { label: "Access i-th", value: "O(n) — walk from head" },
    { label: "Insert at head", value: "O(1)" },
    { label: "Node", value: "value + next pointer" },
  ];
}

/* ════════════════════════════════════════════════════════════════
   CS — Binary tree traversal (in / pre / post-order)
   ════════════════════════════════════════════════════════════════ */
const TREE_POS: [number, number][] = [
  [0, 2],
  [-2, 0.5],
  [2, 0.5],
  [-3, -1],
  [-1, -1],
  [1, -1],
  [3, -1],
];
const TREE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
];
const TREE_ORDERS: Record<string, number[]> = {
  inorder: [3, 1, 4, 0, 5, 2, 6],
  preorder: [0, 1, 3, 4, 2, 5, 6],
  postorder: [3, 4, 1, 5, 6, 2, 0],
};

export const treeScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 8.5);
  addStudioLights(group);

  for (const [a, b] of TREE_EDGES) {
    group.add(
      line2(
        [
          new THREE.Vector3(TREE_POS[a][0], TREE_POS[a][1], 0),
          new THREE.Vector3(TREE_POS[b][0], TREE_POS[b][1], 0),
        ],
        0x46506c,
      ),
    );
  }

  const nodes = TREE_POS.map(([x, y]) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 26, 20),
      new THREE.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.5, metalness: 0.1 }),
    );
    m.position.set(x, y, 0);
    group.add(m);
    return m;
  });

  return (elapsed) => {
    const order = TREE_ORDERS[str(params, "traversal", "inorder")] ?? TREE_ORDERS.inorder;
    const animate = bool(params, "animate", true);
    const step = animate ? Math.floor(elapsed / 0.7) % (order.length + 2) : order.length - 1;
    nodes.forEach((nd) => {
      const mat = nd.material as THREE.MeshStandardMaterial;
      mat.color.setHex(0x2a3550);
      mat.emissive.setHex(0x000000);
    });
    for (let k = 0; k <= Math.min(step, order.length - 1); k++) {
      const mat = nodes[order[k]].material as THREE.MeshStandardMaterial;
      const isCurrent = k === Math.min(step, order.length - 1);
      mat.color.setHex(isCurrent ? 0x3fbf7f : 0xe2a43b);
      mat.emissive.setHex(isCurrent ? 0x123524 : 0x3a2a0c);
    }
  };
};

export function treeReadouts(p: ParamValues) {
  const key = str(p, "traversal", "inorder");
  const order = TREE_ORDERS[key] ?? TREE_ORDERS.inorder;
  const names: Record<string, string> = {
    inorder: "In-order (L · root · R)",
    preorder: "Pre-order (root · L · R)",
    postorder: "Post-order (L · R · root)",
  };
  return [
    { label: "Traversal", value: names[key] ?? key },
    { label: "Nodes", value: "7" },
    { label: "Height", value: "3 levels" },
    { label: "Visit order", value: order.join(" → ") },
  ];
}

/* ════════════════════════════════════════════════════════════════
   CS — Pathfinding on a grid (BFS · Dijkstra · A*)
   ════════════════════════════════════════════════════════════════ */
const PF_W = 12;
const PF_H = 8;
// Top row and right column are kept open, so a path always exists.
const PF_MAP = [
  "............",
  ".####.####..",
  "....#.#.....",
  ".##.#.#.##..",
  ".#..#.#..#..",
  ".#.####..#..",
  ".#......##..",
  "............",
];

function pfWalls(): boolean[] {
  const w: boolean[] = [];
  for (let r = 0; r < PF_H; r++)
    for (let c = 0; c < PF_W; c++) w[r * PF_W + c] = PF_MAP[r][c] === "#";
  return w;
}

function pfRun(algo: string) {
  const W = PF_W;
  const H = PF_H;
  const walls = pfWalls();
  const start = 0;
  const goal = (H - 1) * W + (W - 1);
  const heuristic = (i: number) => {
    const r = Math.floor(i / W);
    const c = i % W;
    return Math.abs(r - (H - 1)) + Math.abs(c - (W - 1));
  };
  const g: Record<number, number> = { [start]: 0 };
  const came: Record<number, number> = {};
  const visited = new Set<number>();
  const order: number[] = [];
  const frontier: number[] = [start];
  const fval = (i: number) => (algo === "astar" ? g[i] + heuristic(i) : g[i]);

  while (frontier.length) {
    let bi = 0;
    if (algo !== "bfs")
      for (let k = 1; k < frontier.length; k++) if (fval(frontier[k]) < fval(frontier[bi])) bi = k;
    const cur = frontier.splice(bi, 1)[0];
    if (visited.has(cur)) continue;
    visited.add(cur);
    order.push(cur);
    if (cur === goal) break;
    const r = Math.floor(cur / W);
    const c = cur % W;
    const nb: [number, number][] = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    for (const [nr, nc] of nb) {
      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const ni = nr * W + nc;
      if (walls[ni] || visited.has(ni)) continue;
      const ng = g[cur] + 1;
      if (g[ni] === undefined || ng < g[ni]) {
        g[ni] = ng;
        came[ni] = cur;
        frontier.push(ni);
      }
    }
  }

  const path: number[] = [];
  if (visited.has(goal)) {
    let cur: number | undefined = goal;
    while (cur !== undefined && cur !== start) {
      path.push(cur);
      cur = came[cur];
    }
    path.push(start);
    path.reverse();
  }
  return { order, path, start, goal, walls };
}

export const pathfindingScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 11);
  group.add(new THREE.AmbientLight(0xffffff, 0.95));
  const algo = str(params, "algorithm", "astar");
  const { order, path, start, goal, walls } = pfRun(algo);
  const tile = 0.82;
  const ox = (-(PF_W - 1) / 2) * tile;
  const oy = ((PF_H - 1) / 2) * tile;

  const tiles: THREE.Mesh[] = [];
  for (let r = 0; r < PF_H; r++) {
    for (let c = 0; c < PF_W; c++) {
      const i = r * PF_W + c;
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(tile * 0.9, tile * 0.9),
        new THREE.MeshBasicMaterial({ color: walls[i] ? 0x10151f : 0x222b40 }),
      );
      m.position.set(ox + c * tile, oy - r * tile, 0);
      group.add(m);
      tiles.push(m);
    }
  }
  const pathSet = new Set(path);

  return (elapsed) => {
    const animate = bool(params, "animate", true);
    const step = 0.05;
    const reveal = animate
      ? Math.floor((elapsed % (order.length * step + 2.4)) / step)
      : order.length;
    for (let i = 0; i < tiles.length; i++) {
      if (!walls[i]) (tiles[i].material as THREE.MeshBasicMaterial).color.setHex(0x222b40);
    }
    const lim = Math.min(reveal, order.length);
    for (let k = 0; k < lim; k++) {
      (tiles[order[k]].material as THREE.MeshBasicMaterial).color.setHex(0x6a5a2a);
    }
    if (reveal >= order.length) {
      for (const i of pathSet)
        (tiles[i].material as THREE.MeshBasicMaterial).color.setHex(0xe2a43b);
    }
    (tiles[start].material as THREE.MeshBasicMaterial).color.setHex(0x3fbf7f);
    (tiles[goal].material as THREE.MeshBasicMaterial).color.setHex(0xff5a5a);
  };
};

export function pathfindingReadouts(p: ParamValues) {
  const algo = str(p, "algorithm", "astar");
  const { order, path } = pfRun(algo);
  const names: Record<string, string> = {
    bfs: "Breadth-first search",
    dijkstra: "Dijkstra",
    astar: "A* search",
  };
  return [
    { label: "Algorithm", value: names[algo] ?? algo },
    { label: "Cells explored", value: `${order.length}` },
    { label: "Path length", value: `${path.length ? path.length - 1 : 0} steps` },
    { label: "Grid", value: `${PF_W} × ${PF_H}` },
    { label: "Heuristic", value: algo === "astar" ? "Manhattan distance" : "none" },
  ];
}

export function pathfindingChart(p: ParamValues): LabChartData {
  const algos = ["bfs", "dijkstra", "astar"];
  const counts = algos.map((a) => pfRun(a).order.length);
  const cur = str(p, "algorithm", "astar");
  return {
    title: "Cells explored by algorithm",
    kind: "bars",
    yLabel: "cells",
    categories: ["BFS", "Dijkstra", "A*"],
    series: [{ points: counts.map((c, i) => [i, c] as [number, number]), color: "accent" }],
    note: `A* uses a goal-directed heuristic, so it usually explores the fewest cells. Now showing: ${cur.toUpperCase()}.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   ELECTRONICS — Circuit & Ohm's law (V = IR, P = VI)
   ════════════════════════════════════════════════════════════════ */
function ohm(p: ParamValues) {
  const V = num(p, "voltage", 9);
  const r1 = Math.max(1, num(p, "r1", 6));
  const r2 = Math.max(1, num(p, "r2", 6));
  const series = str(p, "config", "series") === "series";
  const R = series ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const I = V / R;
  return { V, r1, r2, series, R, I, P: V * I };
}

function rectLoop(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const add = (x1: number, y1: number, x2: number, y2: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push(new THREE.Vector3(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 0));
    }
  };
  add(-3, 1.6, 3, 1.6, 30);
  add(3, 1.6, 3, -1.6, 16);
  add(3, -1.6, -3, -1.6, 30);
  add(-3, -1.6, -3, 1.6, 16);
  return pts;
}

export const circuitScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 9.5);
  addStudioLights(group);

  const loopPts = rectLoop();
  group.add(line2([...loopPts, loopPts[0].clone()], 0x6ec1ff));

  // battery plates on the left edge
  group.add(
    line2([new THREE.Vector3(-3.18, 0.45, 0), new THREE.Vector3(-2.82, 0.45, 0)], 0xefc97e),
  );
  group.add(
    line2([new THREE.Vector3(-3.08, -0.35, 0), new THREE.Vector3(-2.92, -0.35, 0)], 0xefc97e),
  );
  group.add(line2([new THREE.Vector3(-3, 0.45, 0), new THREE.Vector3(-3, -0.35, 0)], 0x6ec1ff));

  // resistors — layout depends on series/parallel (rebuilds on config)
  const series = str(params, "config", "series") === "series";
  const resMat = () =>
    new THREE.MeshStandardMaterial({ color: 0xb98a3a, roughness: 0.5, metalness: 0.2 });
  if (series) {
    const a = cellBox(0.9, 0.4, 0xb98a3a);
    a.position.set(-0.9, 1.6, 0);
    const b = cellBox(0.9, 0.4, 0xb98a3a);
    b.position.set(0.9, 1.6, 0);
    group.add(a, b);
  } else {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.3), resMat());
    a.position.set(0, 0.7, 0);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.3), resMat());
    b.position.set(0, -0.7, 0);
    group.add(a, b);
    // branch connectors from the top/bottom wires into the parallel pair
    group.add(line2([new THREE.Vector3(-1.5, 1.6, 0), new THREE.Vector3(-1.5, -1.6, 0)], 0x6ec1ff));
    group.add(line2([new THREE.Vector3(1.5, 1.6, 0), new THREE.Vector3(1.5, -1.6, 0)], 0x6ec1ff));
    group.add(line2([new THREE.Vector3(-1.5, 0.7, 0), new THREE.Vector3(1.5, 0.7, 0)], 0x6ec1ff));
    group.add(line2([new THREE.Vector3(-1.5, -0.7, 0), new THREE.Vector3(1.5, -0.7, 0)], 0x6ec1ff));
  }

  // LED on the right edge — brightness tracks the current
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 26, 20),
    new THREE.MeshStandardMaterial({
      color: 0xffd36b,
      emissive: 0xffc24d,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    }),
  );
  led.position.set(3, 0, 0);
  group.add(led);

  const dots = Array.from({ length: 12 }, () => {
    const d = dotMesh(0xefc97e, 0.09);
    group.add(d);
    return d;
  });

  return (elapsed) => {
    const { I } = ohm(params);
    const animate = bool(params, "animate", true);
    const speed = clamp(I * 0.04, 0.015, 0.5);
    const base = animate ? elapsed * speed : 0;
    dots.forEach((d, i) => {
      const t = (base + i / dots.length) % 1;
      d.position.copy(loopPts[Math.floor(t * loopPts.length) % loopPts.length]);
    });
    (led.material as THREE.MeshStandardMaterial).emissiveIntensity = clamp(I / 4, 0.05, 2.6);
  };
};

export function circuitReadouts(p: ParamValues) {
  const { V, R, I, P, series } = ohm(p);
  return [
    { label: "Configuration", value: series ? "Series" : "Parallel" },
    { label: "Voltage", value: `${V.toFixed(1)} V` },
    { label: "Total resistance", value: `${R.toFixed(2)} Ω` },
    { label: "Current (I = V/R)", value: `${I.toFixed(2)} A` },
    { label: "Power (P = VI)", value: `${P.toFixed(2)} W` },
  ];
}

export function circuitChart(p: ParamValues): LabChartData {
  const { V, R } = ohm(p);
  const pts: [number, number][] = [];
  for (let r = 1; r <= 40; r += 0.5) pts.push([r, V / r]);
  return {
    title: "Current vs resistance (I = V/R)",
    xLabel: "resistance (Ω)",
    yLabel: "current (A)",
    series: [{ points: pts, color: "accent" }],
    markers: [{ x: R, y: V / R, color: "violet" }],
    note: `Ohm's law at ${V.toFixed(0)} V: doubling resistance halves the current. Series adds R; parallel lowers it.`,
  };
}

/* ════════════════════════════════════════════════════════════════
   CHEMISTRY — Interactive periodic table (periods 1–4, Z = 1…36)
   ════════════════════════════════════════════════════════════════ */
type PTElement = {
  z: number;
  sym: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  cat: string;
};
const PT_DATA: PTElement[] = (
  [
    [1, "H", "Hydrogen", 1.008, 1, 1, "nonmetal"],
    [2, "He", "Helium", 4.003, 18, 1, "noble"],
    [3, "Li", "Lithium", 6.94, 1, 2, "alkali"],
    [4, "Be", "Beryllium", 9.012, 2, 2, "alkaline"],
    [5, "B", "Boron", 10.81, 13, 2, "metalloid"],
    [6, "C", "Carbon", 12.011, 14, 2, "nonmetal"],
    [7, "N", "Nitrogen", 14.007, 15, 2, "nonmetal"],
    [8, "O", "Oxygen", 15.999, 16, 2, "nonmetal"],
    [9, "F", "Fluorine", 18.998, 17, 2, "halogen"],
    [10, "Ne", "Neon", 20.18, 18, 2, "noble"],
    [11, "Na", "Sodium", 22.99, 1, 3, "alkali"],
    [12, "Mg", "Magnesium", 24.305, 2, 3, "alkaline"],
    [13, "Al", "Aluminium", 26.982, 13, 3, "post"],
    [14, "Si", "Silicon", 28.085, 14, 3, "metalloid"],
    [15, "P", "Phosphorus", 30.974, 15, 3, "nonmetal"],
    [16, "S", "Sulfur", 32.06, 16, 3, "nonmetal"],
    [17, "Cl", "Chlorine", 35.45, 17, 3, "halogen"],
    [18, "Ar", "Argon", 39.948, 18, 3, "noble"],
    [19, "K", "Potassium", 39.098, 1, 4, "alkali"],
    [20, "Ca", "Calcium", 40.078, 2, 4, "alkaline"],
    [21, "Sc", "Scandium", 44.956, 3, 4, "transition"],
    [22, "Ti", "Titanium", 47.867, 4, 4, "transition"],
    [23, "V", "Vanadium", 50.942, 5, 4, "transition"],
    [24, "Cr", "Chromium", 51.996, 6, 4, "transition"],
    [25, "Mn", "Manganese", 54.938, 7, 4, "transition"],
    [26, "Fe", "Iron", 55.845, 8, 4, "transition"],
    [27, "Co", "Cobalt", 58.933, 9, 4, "transition"],
    [28, "Ni", "Nickel", 58.693, 10, 4, "transition"],
    [29, "Cu", "Copper", 63.546, 11, 4, "transition"],
    [30, "Zn", "Zinc", 65.38, 12, 4, "transition"],
    [31, "Ga", "Gallium", 69.723, 13, 4, "post"],
    [32, "Ge", "Germanium", 72.63, 14, 4, "metalloid"],
    [33, "As", "Arsenic", 74.922, 15, 4, "metalloid"],
    [34, "Se", "Selenium", 78.971, 16, 4, "nonmetal"],
    [35, "Br", "Bromine", 79.904, 17, 4, "halogen"],
    [36, "Kr", "Krypton", 83.798, 18, 4, "noble"],
  ] as const
).map(([z, sym, name, mass, group, period, cat]) => ({ z, sym, name, mass, group, period, cat }));

const PT_COLORS: Record<string, number> = {
  alkali: 0xff7a59,
  alkaline: 0xffb259,
  transition: 0x6ec1ff,
  post: 0x9aa3b4,
  metalloid: 0x7a6bff,
  nonmetal: 0x3fbf7f,
  halogen: 0xefc97e,
  noble: 0xff5a9e,
};
const PT_CAT_LABEL: Record<string, string> = {
  alkali: "Alkali metal",
  alkaline: "Alkaline earth metal",
  transition: "Transition metal",
  post: "Post-transition metal",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  noble: "Noble gas",
};

function ptSelected(p: ParamValues): PTElement {
  const z = clampInt(num(p, "z", 6), 1, 36);
  return PT_DATA[z - 1] ?? PT_DATA[5];
}

export const periodicTableScene: SceneInit = ({ group, camera, params }) => {
  camera.position.set(0, 0, 13);
  group.add(new THREE.AmbientLight(0xffffff, 0.95));
  addStudioLights(group);

  const tw = 0.62;
  const th = 0.66;
  const tiles: { mesh: THREE.Mesh; base: number }[] = [];
  for (const el of PT_DATA) {
    const base = PT_COLORS[el.cat] ?? 0x6ec1ff;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(tw * 0.9, th * 0.9, 0.22),
      new THREE.MeshStandardMaterial({ color: base, roughness: 0.55, metalness: 0.1 }),
    );
    m.position.set((el.group - 9.5) * tw, (2.5 - el.period) * th, 0);
    group.add(m);
    tiles.push({ mesh: m, base });
  }

  return () => {
    const z = clampInt(num(params, "z", 6), 1, 36);
    tiles.forEach((t, i) => {
      const sel = i === z - 1;
      const mat = t.mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(t.base);
      mat.emissive.setHex(sel ? t.base : 0x000000);
      mat.emissiveIntensity = sel ? 0.6 : 0;
      const s = sel ? 1.7 : 1;
      t.mesh.scale.set(s, s, sel ? 4 : 1);
    });
  };
};

export function periodicTableReadouts(p: ParamValues) {
  const el = ptSelected(p);
  return [
    { label: "Selected", value: `${el.name} (${el.sym})` },
    { label: "Atomic number", value: `${el.z}` },
    { label: "Atomic mass", value: `${el.mass.toFixed(3)} u` },
    { label: "Group · Period", value: `${el.group} · ${el.period}` },
    { label: "Category", value: PT_CAT_LABEL[el.cat] ?? el.cat },
  ];
}

export function periodicTableChart(p: ParamValues): LabChartData {
  const el = ptSelected(p);
  const pts: [number, number][] = PT_DATA.map((e) => [e.z, e.mass]);
  return {
    title: "Atomic mass climbs with atomic number",
    xLabel: "atomic number Z",
    yLabel: "mass (u)",
    series: [{ points: pts, color: "accent" }],
    markers: [{ x: el.z, y: el.mass, color: "violet", label: el.sym }],
    note: `${el.name}: Z = ${el.z}, mass ≈ ${el.mass.toFixed(1)} u. Mass rises with Z (with a few inversions, e.g. Ar/K).`,
  };
}
