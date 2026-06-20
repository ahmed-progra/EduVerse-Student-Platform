"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Everything a scene builder receives. The builder populates `group`
 *  (which the stage auto-rotates and lets the user drag-orbit) and may
 *  return a per-frame update callback. */
export interface SceneAPI {
  scene: THREE.Scene;
  group: THREE.Group;
  camera: THREE.PerspectiveCamera;
  THREE: typeof THREE;
}

export type SceneFrame = (elapsed: number, delta: number) => void;
export type SceneInit = (api: SceneAPI) => SceneFrame | void;

/**
 * A self-contained three.js stage. Transparent background (so the cosmic
 * ambient shows through), gentle auto-rotation, and pointer drag-orbit.
 * Cleans up fully on unmount. No external controls dependency.
 */
export function ThreeScene({ init, className }: { init: SceneInit; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 1.5, 9);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL unavailable — leave the (transparent) container empty.
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const frame = initRef.current({ scene, group, camera, THREE }) || undefined;

    // ── Manual drag-orbit (no OrbitControls dependency) ──
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotY = 0.4;
    let targetRotX = 0.18;
    let rotY = 0.4;
    let rotX = 0.18;
    let autoRotate = true;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      autoRotate = false;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.008;
      targetRotX += (e.clientY - lastY) * 0.008;
      targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (autoRotate && !reduceMotion) targetRotY += delta * 0.18;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      group.rotation.y = rotY;
      group.rotation.x = rotX;
      if (frame && !reduceMotion) frame(elapsed, delta);
      else if (frame && elapsed < 0.05) frame(0, 0); // settle one frame for reduced-motion
      renderer.render(scene, camera);
    };
    render();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
