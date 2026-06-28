"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Live, mutable parameter values that a scene reads every frame. */
export type ParamValues = Record<string, number | boolean | string>;

/** Everything a scene builder receives. The builder populates `group`
 *  (which the stage auto-rotates and lets the user drag-orbit), reads live
 *  values from `params` each frame, and may return a per-frame update callback. */
export interface SceneAPI {
  scene: THREE.Scene;
  group: THREE.Group;
  camera: THREE.PerspectiveCamera;
  THREE: typeof THREE;
  /** Live parameter object — same identity for the scene's lifetime, mutated in
   *  place as the user moves sliders. Read it inside the frame callback. */
  params: ParamValues;
}

export type SceneFrame = (elapsed: number, delta: number) => void;
export type SceneInit = (api: SceneAPI) => SceneFrame | void;

/** Handle the stage hands back so the parent can drive view-level actions. */
export interface SceneHandle {
  reset: () => void;
}

interface ThreeSceneProps {
  init: SceneInit;
  /** Current control values. Continuous changes are read live; pass a changing
   *  `rebuildKey` for structural changes that require a full rebuild. */
  params?: ParamValues;
  /** When this string changes the scene is torn down and rebuilt (used for
   *  switching models or structural params like vertex resolution). */
  rebuildKey?: string;
  className?: string;
  onReady?: (handle: SceneHandle) => void;
  /** Opt-in PBR environment lighting + ACES tone mapping — for realistic
   *  metals/glass (gears, chrome, instruments). Off by default so existing
   *  scenes render exactly as before. */
  environment?: boolean;
}

/**
 * A self-contained three.js stage. Transparent background (so the cosmic
 * ambient shows through), gentle auto-rotation governed by the live `autoRotate`
 * param, and pointer drag-orbit. Cleans up fully on unmount.
 */
export function ThreeScene({
  init,
  params,
  rebuildKey,
  className,
  onReady,
  environment,
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const envRef = useRef(environment);
  envRef.current = environment;
  // One stable object for the component's life — mutated in place so the running
  // render loop always sees the latest slider values without a rebuild.
  const liveRef = useRef<ParamValues>({});
  Object.assign(liveRef.current, params ?? {});

  const initRef = useRef(init);
  initRef.current = init;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    setFailed(false);

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 1.5, 9);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL unavailable — surface a recoverable message instead of a blank box.
      setFailed(true);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Opt-in realistic lighting: image-based environment + filmic tone mapping.
    let pmrem: THREE.PMREMGenerator | null = null;
    let envTex: THREE.Texture | null = null;
    if (envRef.current) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      pmrem = new THREE.PMREMGenerator(renderer);
      envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
    }
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const frame =
      initRef.current({ scene, group, camera, THREE, params: liveRef.current }) || undefined;

    // Snapshot the scene's chosen framing so Reset can restore it.
    const homeCamZ = camera.position.z;
    const HOME_ROT_Y = 0.4;
    const HOME_ROT_X = 0.18;

    // ── Manual drag-orbit (no OrbitControls dependency) ──
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotY = HOME_ROT_Y;
    let targetRotX = HOME_ROT_X;
    let rotY = HOME_ROT_Y;
    let rotX = HOME_ROT_X;

    const onDown = (e: PointerEvent) => {
      dragging = true;
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
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3, Math.min(22, camera.position.z + e.deltaY * 0.004));
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Expose view-level actions to the parent.
    onReadyRef.current?.({
      reset: () => {
        targetRotY = HOME_ROT_Y;
        targetRotX = HOME_ROT_X;
        camera.position.z = homeCamZ;
      },
    });

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const spin = liveRef.current.autoRotate === undefined ? true : !!liveRef.current.autoRotate;
      // Auto-orbit is governed by the Spin tool (autoRotate param). The scene
      // frame ALWAYS runs so live parameter edits and the user's Play/Pause
      // simulations apply — even under prefers-reduced-motion, which must never
      // freeze interactivity (it previously froze the frame after one tick, so
      // sliders appeared to do nothing). Every animation here is user-pausable.
      if (spin && !dragging) targetRotY += delta * 0.18;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      group.rotation.y = rotY;
      group.rotation.x = rotX;
      if (frame) frame(elapsed, delta);
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
      renderer.domElement.removeEventListener("wheel", onWheel);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      if (envTex) envTex.dispose();
      if (pmrem) pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // Rebuild only when the structural key changes; continuous params are live.
  }, [rebuildKey]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {failed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6"
          role="status"
          style={{ color: "var(--color-eduverse-text-muted)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--color-eduverse-text)" }}>
            3D unavailable
          </span>
          <span className="text-xs" style={{ maxWidth: "20rem" }}>
            Your browser or device couldn&apos;t start WebGL. Try another browser or enable hardware
            acceleration.
          </span>
        </div>
      )}
    </div>
  );
}
