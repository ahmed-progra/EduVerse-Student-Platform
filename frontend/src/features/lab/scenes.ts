import * as THREE from "three";
import type { SceneInit } from "./three-scene";

const AMBER = 0xe2a43b;
const AMBER_LIGHT = 0xefc97e;
const INDIGO = 0x7a6bff;

/**
 * MATH — a live 3D function surface z = f(x, y, t). The mesh ripples in real
 * time (interfering sine waves) with a translucent wireframe overlay, so you
 * can see a multivariable surface breathe and read its curvature.
 */
export const mathScene: SceneInit = ({ group, camera }) => {
  camera.position.set(0, 4.2, 8);

  const segments = 50;
  const size = 6;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const surface = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: AMBER,
      metalness: 0.35,
      roughness: 0.45,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
  );
  group.add(surface);

  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: AMBER_LIGHT, wireframe: true, transparent: true, opacity: 0.16 }),
  );
  group.add(wire);

  const dir = new THREE.DirectionalLight(0xffffff, 1.25);
  dir.position.set(5, 8, 5);
  group.add(dir);
  group.add(new THREE.AmbientLight(0x8899ff, 0.45));
  const point = new THREE.PointLight(INDIGO, 0.9, 30);
  point.position.set(-4, 4, -2);
  group.add(point);

  const pos = geo.attributes.position;
  return (t) => {
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y =
        Math.sin(x * 0.9 + t) * 0.6 +
        Math.cos(z * 0.9 + t * 0.8) * 0.6 +
        Math.sin((x * x + z * z) * 0.12 - t) * 0.4;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };
};

/**
 * PHYSICS — a Keplerian orbit sandbox. A radiant star lights four planets that
 * sweep their orbits at speeds set by radius, with faint orbit rings. Watch how
 * inner bodies race while outer ones drift: orbital mechanics, made tangible.
 */
export const physicsScene: SceneInit = ({ group, camera }) => {
  camera.position.set(0, 6, 13);

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
  group.add(new THREE.PointLight(0xffd9a0, 2.6, 80));
  group.add(new THREE.AmbientLight(0x33425f, 0.55));

  const defs = [
    { r: 3, size: 0.34, color: 0x6ec1ff, speed: 0.95, tilt: 0.05 },
    { r: 4.6, size: 0.5, color: AMBER, speed: 0.62, tilt: 0.22 },
    { r: 6.3, size: 0.42, color: 0x9b8cff, speed: 0.43, tilt: 0.1 },
    { r: 8.1, size: 0.62, color: 0x4fd2a0, speed: 0.31, tilt: 0.32 },
  ];

  const planets = defs.map((d, i) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(d.r - 0.015, d.r + 0.015, 120),
      new THREE.MeshBasicMaterial({ color: 0x99a3c4, transparent: true, opacity: 0.13, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(d.size, 28, 28),
      new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.6, metalness: 0.15 }),
    );
    group.add(mesh);
    return { mesh, r: d.r, speed: d.speed, phase: i * 1.3, tilt: d.tilt };
  });

  return (t) => {
    for (const p of planets) {
      const a = t * p.speed + p.phase;
      p.mesh.position.set(Math.cos(a) * p.r, Math.sin(a) * p.r * Math.sin(p.tilt), Math.sin(a) * p.r);
    }
    sun.rotation.y = t * 0.2;
  };
};

/**
 * SCIENCE — a DNA double helix. Two sugar-phosphate backbones spiral around a
 * shared axis, joined by colour-coded base-pair rungs. It spins on its axis so
 * you can read the major and minor grooves of the structure of life.
 */
export const scienceScene: SceneInit = ({ group, camera }) => {
  camera.position.set(0, 0, 12);

  group.add(new THREE.AmbientLight(0x8090ff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 6);
  group.add(key);
  const warm = new THREE.PointLight(AMBER, 1.1, 40);
  warm.position.set(-4, -3, 4);
  group.add(warm);

  const turns = 3;
  const perTurn = 16;
  const total = turns * perTurn;
  const radius = 1.7;
  const height = 8.4;
  const basePairColors = [0xff6b8b, 0x4fd2a0, 0xffd166, 0x6ec1ff];

  const backboneA = new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.35, metalness: 0.25 });
  const backboneB = new THREE.MeshStandardMaterial({ color: 0x6e8bff, roughness: 0.35, metalness: 0.25 });
  const nodeGeo = new THREE.SphereGeometry(0.23, 20, 20);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < total; i++) {
    const frac = i / (total - 1);
    const ang = frac * turns * Math.PI * 2;
    const y = (frac - 0.5) * height;
    const x1 = Math.cos(ang) * radius;
    const z1 = Math.sin(ang) * radius;
    const x2 = Math.cos(ang + Math.PI) * radius;
    const z2 = Math.sin(ang + Math.PI) * radius;

    const a = new THREE.Mesh(nodeGeo, backboneA);
    a.position.set(x1, y, z1);
    group.add(a);
    const b = new THREE.Mesh(nodeGeo, backboneB);
    b.position.set(x2, y, z2);
    group.add(b);

    if (i % 2 === 0) {
      const len = Math.hypot(x1 - x2, z1 - z2);
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, len, 10),
        new THREE.MeshStandardMaterial({ color: basePairColors[(i / 2) % basePairColors.length], roughness: 0.5 }),
      );
      const dirVec = new THREE.Vector3(x2 - x1, 0, z2 - z1).normalize();
      rung.quaternion.setFromUnitVectors(up, dirVec);
      rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      group.add(rung);
    }
  }
};
