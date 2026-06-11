"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Lock, Zap, Check, Plus, Minus, Maximize2 } from "lucide-react";

/*
 * The skill tree as an arcane chart: every branch on one pannable,
 * zoomable field. Pure SVG — no canvas, no extra dependencies.
 * Nodes are sigils (unlocked / ready / locked), prerequisites are
 * routes that draw themselves in on first view.
 */

export interface MapNode {
  id: string;
  name: string;
  branch: string;
  xpCost: number;
  levelRequired: number;
  position: { x: number; y: number };
  unlocked: boolean;
  prerequisites?: string[];
}

type NodeStatus = "completed" | "available" | "locked";

const NODE_R = 24;
const COL_W = 230;
const ROW_H = 175;
const PAD_X = 110;
const PAD_Y = 120;

const BRANCH_NAMES: Record<string, string> = {
  python_mastery: "Python Mastery",
  frontend_mastery: "Frontend Mastery",
  algorithms: "Algorithms Path",
  debugging: "Debugging Path",
};

function clamp(v: number, a: number, b: number) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return Math.min(Math.max(v, lo), hi);
}

export function SkillMap({
  nodes,
  getStatus,
  selectedId,
  justUnlocked,
  onSelect,
}: {
  nodes: MapNode[];
  getStatus: (node: MapNode) => NodeStatus;
  selectedId: string | null;
  justUnlocked: string | null;
  onSelect: (node: MapNode | null) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 0.8, tx: 0, ty: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, tx: 0, ty: 0 });

  /* ── Layout: branches as stacked routes with a hand-drawn wobble ── */
  const { placed, branches, worldW, worldH } = useMemo(() => {
    const branchKeys = [...new Set(nodes.map((n) => n.branch))];
    const byId = new Map<string, { node: MapNode; x: number; y: number }>();

    branchKeys.forEach((branch, bi) => {
      nodes
        .filter((n) => n.branch === branch)
        .forEach((node) => {
          const px = node.position.x - 1;
          const x = PAD_X + px * COL_W;
          const y = PAD_Y + bi * ROW_H + Math.sin(px * 1.35 + bi * 1.7) * 26;
          byId.set(node.id, { node, x, y });
        });
    });

    const xs = [...byId.values()].map((p) => p.x);
    const w = (xs.length ? Math.max(...xs) : 600) + PAD_X + 60;
    const h = PAD_Y + branchKeys.length * ROW_H;
    return { placed: byId, branches: branchKeys, worldW: w, worldH: h };
  }, [nodes]);

  const clampView = useCallback((next: { s: number; tx: number; ty: number }) => {
    const vp = viewportRef.current;
    if (!vp) return next;
    const pad = 90;
    return {
      s: next.s,
      tx: clamp(next.tx, vp.clientWidth - worldW * next.s - pad, pad),
      ty: clamp(next.ty, vp.clientHeight - worldH * next.s - pad, pad),
    };
  }, [worldW, worldH]);

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const s = clamp(Math.min((vp.clientWidth - 48) / worldW, (vp.clientHeight - 48) / worldH), 0.42, 1.1);
    setView({
      s,
      tx: (vp.clientWidth - worldW * s) / 2,
      ty: (vp.clientHeight - worldH * s) / 2,
    });
  }, [worldW, worldH]);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  const zoom = (dir: 1 | -1) => {
    const vp = viewportRef.current;
    if (!vp) return;
    setView((v) => {
      const s = clamp(v.s + dir * 0.16, 0.42, 1.7);
      // keep the viewport's center fixed while zooming
      const cx = (vp.clientWidth / 2 - v.tx) / v.s;
      const cy = (vp.clientHeight / 2 - v.ty) / v.s;
      return clampView({ s, tx: vp.clientWidth / 2 - cx * s, ty: vp.clientHeight / 2 - cy * s });
    });
  };

  /* ── Pan (pointer capture, multi-touch ignored, click-vs-drag threshold) ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (dragRef.current.active) return;
    dragRef.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY, tx: view.tx, ty: view.ty };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) {
      setView((v) => clampView({ s: v.s, tx: d.tx + dx, ty: d.ty + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    // a clean click on the background clears the selection
    if (!wasDrag && e.target === e.currentTarget.querySelector("svg")) {
      onSelect(null);
    }
  };

  const handleNodeActivate = (node: MapNode) => {
    if (dragRef.current.moved) return;
    onSelect(node);
  };

  /* ── Routes ── */
  const routes = useMemo(() => {
    const out: { id: string; d: string; active: boolean }[] = [];
    placed.forEach(({ node, x, y }) => {
      (node.prerequisites || []).forEach((pid) => {
        const from = placed.get(pid);
        if (!from) return;
        const x1 = from.x + NODE_R;
        const y1 = from.y;
        const x2 = x - NODE_R;
        const y2 = y;
        const bend = Math.min(56, Math.abs(x2 - x1) / 2);
        out.push({
          id: `${pid}->${node.id}`,
          d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
          active: from.node.unlocked,
        });
      });
    });
    return out;
  }, [placed]);

  const statusOf = (node: MapNode): NodeStatus => getStatus(node);

  return (
    <div
      ref={viewportRef}
      className={`skill-map-viewport ${dragging ? "dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* map key */}
      <div className="sm-key" aria-hidden="true">
        <span><i style={{ background: "var(--color-eduverse-accent)" }} />unlocked</span>
        <span><i style={{ border: "1px solid var(--color-eduverse-accent)", background: "transparent" }} />ready</span>
        <span><i style={{ border: "1px solid var(--color-eduverse-text-muted)", background: "transparent", opacity: 0.6 }} />locked</span>
      </div>

      {/* zoom controls */}
      <div className="sm-controls">
        <button className="sm-ctrl" onClick={() => zoom(1)} aria-label="Zoom in"><Plus size={15} /></button>
        <button className="sm-ctrl" onClick={() => zoom(-1)} aria-label="Zoom out"><Minus size={15} /></button>
        <button className="sm-ctrl" onClick={fit} aria-label="Fit map to view"><Maximize2 size={13} /></button>
      </div>

      <div
        className={`skill-map-world ${dragging ? "" : "smooth"}`}
        style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`, width: worldW, height: worldH }}
      >
        <svg width={worldW} height={worldH} viewBox={`0 0 ${worldW} ${worldH}`} role="group" aria-label="Skill map">
          {/* cartographic contours */}
          <g aria-hidden="true" opacity="0.35">
            <circle cx={worldW * 0.22} cy={worldH * 0.3} r={170} fill="none" stroke="var(--color-eduverse-border)" />
            <circle cx={worldW * 0.22} cy={worldH * 0.3} r={250} fill="none" stroke="var(--color-eduverse-border)" strokeDasharray="2 7" />
            <circle cx={worldW * 0.8} cy={worldH * 0.75} r={200} fill="none" stroke="var(--color-eduverse-border)" />
            <circle cx={worldW * 0.8} cy={worldH * 0.75} r={290} fill="none" stroke="var(--color-eduverse-border)" strokeDasharray="2 7" />
          </g>

          {/* branch toponymy */}
          {branches.map((branch, bi) => (
            <text key={branch} className="sm-topo" x={PAD_X - NODE_R} y={PAD_Y + bi * ROW_H - 58}>
              <tspan fill="var(--color-eduverse-accent)">{"// "}</tspan>
              {(BRANCH_NAMES[branch] || branch).toUpperCase()}
            </text>
          ))}

          {/* prerequisite routes */}
          {routes.map((r, i) =>
            r.active ? (
              <path
                key={r.id}
                className="sm-path-solid"
                d={r.d}
                pathLength={1}
                fill="none"
                stroke="var(--color-eduverse-accent)"
                strokeWidth={1.6}
                opacity={0.75}
                style={{ "--d": `${0.15 + i * 0.08}s` } as React.CSSProperties}
              />
            ) : (
              <path
                key={r.id}
                className="sm-path-dim"
                d={r.d}
                fill="none"
                stroke="var(--color-eduverse-border-mid)"
                strokeWidth={1.3}
                strokeDasharray="4 5"
                style={{ "--d": `${0.15 + i * 0.08}s` } as React.CSSProperties}
              />
            )
          )}

          {/* sigils */}
          {[...placed.values()].map(({ node, x, y }) => {
            const status = statusOf(node);
            const selected = selectedId === node.id;
            return (
              <g
                key={node.id}
                className="sm-node"
                transform={`translate(${x}, ${y})`}
                role="button"
                tabIndex={0}
                aria-label={`${node.name}, ${status === "completed" ? "unlocked" : status === "available" ? "ready to unlock" : "locked"}, ${node.xpCost} XP, level ${node.levelRequired} required`}
                onClick={() => handleNodeActivate(node)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(node);
                  }
                }}
              >
                {/* selection halo */}
                {selected && (
                  <circle r={NODE_R + 9} fill="none" stroke="var(--color-eduverse-accent)" strokeWidth={1} strokeDasharray="3 4" opacity={0.9} />
                )}

                {/* ready beacon */}
                {status === "available" && (
                  <circle className="sm-pulse" r={NODE_R + 5} fill="none" stroke="var(--color-eduverse-accent)" strokeWidth={1.2} />
                )}

                {/* unlock celebration */}
                {justUnlocked === node.id && (
                  <circle className="sm-burst" r={NODE_R} fill="none" stroke="var(--color-eduverse-accent)" strokeWidth={2} />
                )}

                {/* sigil body */}
                <circle
                  className="ring"
                  r={NODE_R}
                  fill={status === "completed" ? "var(--color-eduverse-accent)" : "var(--color-eduverse-surface)"}
                  stroke={
                    status === "completed"
                      ? "var(--color-eduverse-accent)"
                      : status === "available"
                      ? "var(--color-eduverse-accent-strong)"
                      : "var(--color-eduverse-border-mid)"
                  }
                  strokeWidth={1.5}
                  opacity={status === "locked" ? 0.65 : 1}
                />

                {/* glyph */}
                <g transform="translate(-8, -8)" opacity={status === "locked" ? 0.6 : 1} aria-hidden="true">
                  {status === "completed" ? (
                    <Check size={16} color="oklch(12% 0.02 55)" strokeWidth={3} />
                  ) : status === "available" ? (
                    <Zap size={16} color="var(--color-eduverse-accent)" />
                  ) : (
                    <Lock size={16} color="var(--color-eduverse-text-muted)" />
                  )}
                </g>

                {/* labels */}
                <text className="sm-name" textAnchor="middle" y={NODE_R + 20} opacity={status === "locked" ? 0.7 : 1}>
                  {node.name}
                </text>
                <text className="sm-meta" textAnchor="middle" y={NODE_R + 35}>
                  {node.xpCost} XP · LV {node.levelRequired}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
