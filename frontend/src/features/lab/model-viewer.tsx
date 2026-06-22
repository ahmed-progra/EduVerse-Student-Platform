"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ParamValues, SceneHandle } from "./three-scene";

/**
 * A self-contained glTF/GLB model viewer. PBR environment lighting, auto-centering
 * and auto-scaling, pointer drag-orbit, wheel zoom, and a loading overlay.
 * Reads live params — `autoRotate`, `wireframe`, `explode` — so the workbench can
 * drive it with the same controls as the procedural scenes. Transparent
 * background so the cosmic ambient shows through.
 */
export function ModelViewer({
  url,
  params,
  className,
  onReady,
}: {
  url: string;
  params?: ParamValues;
  className?: string;
  onReady?: (handle: SceneHandle) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const liveRef = useRef<ParamValues>({});
  Object.assign(liveRef.current, params ?? {});
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 2000);
    const HOME_CAM_Z = 6;
    camera.position.set(0, 0.4, HOME_CAM_Z);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setStatus("error");
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    // Image-based lighting so PBR / specular materials read correctly.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x180f08, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd9a0, 1.1);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    // Per-mesh explode data: original local position + outward direction.
    const explodable: { mesh: THREE.Mesh; home: THREE.Vector3; dir: THREE.Vector3 }[] = [];

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        model.scale.setScalar(3.2 / maxDim);
        group.add(model);

        // Record explode vectors relative to the model centre.
        const worldCenter = new THREE.Vector3();
        new THREE.Box3().setFromObject(model).getCenter(worldCenter);
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const meshCenter = new THREE.Vector3();
          new THREE.Box3().setFromObject(mesh).getCenter(meshCenter);
          const dir = meshCenter.sub(worldCenter);
          if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
          explodable.push({ mesh, home: mesh.position.clone(), dir: dir.normalize() });
        });
        setStatus("ready");
      },
      (e) => {
        if (e.total) setProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      },
      () => {
        if (!disposed) setStatus("error");
      },
    );

    // ── Drag-orbit + wheel zoom ──
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const HOME_ROT_Y = 0.5;
    const HOME_ROT_X = 0.12;
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
      targetRotX = Math.max(-1.3, Math.min(1.3, targetRotX));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(2.2, Math.min(11, camera.position.z + e.deltaY * 0.0025));
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    onReadyRef.current?.({
      reset: () => {
        targetRotY = HOME_ROT_Y;
        targetRotX = HOME_ROT_X;
        camera.position.z = HOME_CAM_Z;
      },
    });

    let lastWire: boolean | null = null;
    let lastExplode = -1;

    let raf = 0;
    const clock = new THREE.Clock();
    const render = () => {
      raf = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const p = liveRef.current;
      const spin = p.autoRotate === undefined ? true : !!p.autoRotate;
      // Auto-orbit follows the Spin tool (autoRotate) for everyone — never
      // hard-disabled by reduced-motion (it's a user-controlled toggle).
      if (spin && !dragging) targetRotY += delta * 0.16;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      group.rotation.y = rotY;
      group.rotation.x = rotX;

      // Apply wireframe only when it changes.
      const wire = !!p.wireframe;
      if (wire !== lastWire) {
        lastWire = wire;
        group.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
          const apply = (m: THREE.Material) => {
            (m as THREE.MeshStandardMaterial).wireframe = wire;
          };
          if (Array.isArray(mat)) mat.forEach(apply);
          else if (mat) apply(mat);
        });
      }

      // Apply explode only when it changes.
      const explode = typeof p.explode === "number" ? p.explode : 0;
      if (explode !== lastExplode) {
        lastExplode = explode;
        for (const it of explodable) {
          it.mesh.position.copy(it.home).addScaledVector(it.dir, explode);
        }
      }

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
      disposed = true;
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
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [url]);

  return (
    <div className="lab-viewer-wrap">
      <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />
      {status !== "ready" && (
        <div className="lab-loading" aria-live="polite">
          {status === "loading" ? (
            <>
              <div className="spinner" role="status" aria-label="Loading model" />
              <span>Loading model{progress ? ` · ${progress}%` : "…"}</span>
            </>
          ) : (
            <span>Couldn&apos;t load this model.</span>
          )}
        </div>
      )}
    </div>
  );
}
