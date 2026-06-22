"use client";

import { useId } from "react";

/* ════════════════════════════════════════════════════════════════
   LabChart — a simulation-native graph for the 3D Lab.

   It is intentionally NOT a generic dashboard widget: each chart is
   computed from the SAME live `params` that drive the 3D scene, so
   moving a slider reshapes the curve in lock-step with the model.
   Pure SVG (no chart lib), token-driven colours, and reduced-motion
   safe (the draw-in resolves to the final frame under the global
   reduce rule). It reads as part of the instrument, not beside it.
   ════════════════════════════════════════════════════════════════ */

export type ChartColor = "accent" | "violet" | "success" | "danger" | "muted";

export interface ChartSeries {
  /** Data-space points. For "line" charts these are [x, y]; for "bars", [index, value]. */
  points: [number, number][];
  color?: ChartColor;
  /** Shown in the legend when present. */
  label?: string;
  /** Fill the area between the line and the baseline. */
  area?: boolean;
  /** Render as a dashed line (e.g. a reference/ideal curve). */
  dashed?: boolean;
  /** Draw a dot at every point (e.g. discrete planets). */
  dots?: boolean;
  /** Suppress the connecting line (use with `dots` for a scatter). */
  noLine?: boolean;
}

export interface ChartMarker {
  x: number;
  y: number;
  color?: ChartColor;
  label?: string;
}

export interface LabChartData {
  title: string;
  xLabel?: string;
  yLabel?: string;
  kind?: "line" | "bars";
  series: ChartSeries[];
  xDomain?: [number, number];
  yDomain?: [number, number];
  /** Highlighted "current value" points with a pulsing ring. */
  markers?: ChartMarker[];
  /** Category labels for bar charts (aligned to series[0] point order). */
  categories?: string[];
  note?: string;
  /** Emphasise the y = 0 line (equilibrium). */
  zeroLine?: boolean;
  /** Keep the plot region square (true Lissajous aspect). */
  square?: boolean;
}

const PALETTE: Record<ChartColor, { stroke: string; fill: string }> = {
  accent: { stroke: "oklch(80% 0.14 85)", fill: "oklch(80% 0.14 85 / 0.22)" },
  violet: { stroke: "oklch(72% 0.13 290)", fill: "oklch(72% 0.13 290 / 0.16)" },
  success: { stroke: "oklch(76% 0.14 165)", fill: "oklch(76% 0.14 165 / 0.16)" },
  danger: { stroke: "oklch(66% 0.19 25)", fill: "oklch(66% 0.19 25 / 0.16)" },
  muted: { stroke: "oklch(64% 0.028 264)", fill: "oklch(64% 0.028 264 / 0.12)" },
};

const W = 380;
const H = 188;
const PAD = { l: 40, r: 16, t: 16, b: 32 };

function fmt(v: number) {
  if (!isFinite(v)) return "—";
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function LabChart({ data }: { data: LabChartData }) {
  const uid = useId().replace(/:/g, "");
  const allPts = data.series.flatMap((s) => s.points);
  if (allPts.length === 0) return null;

  const isBars = data.kind === "bars";

  const xs = allPts.map((p) => p[0]);
  const ys = allPts.map((p) => p[1]);
  let [x0, x1] = data.xDomain ?? [Math.min(...xs), Math.max(...xs)];
  let [y0, y1] = data.yDomain ?? [Math.min(...ys), Math.max(...ys)];
  if (!data.yDomain) {
    const padY = (y1 - y0) * 0.12 || 1;
    y0 -= padY;
    y1 += padY;
  }
  if (isBars) y0 = Math.min(0, y0);
  if (x0 === x1) x1 = x0 + 1;
  if (y0 === y1) y1 = y0 + 1;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const plotW = data.square ? Math.min(innerW, innerH) : innerW;
  const offX = PAD.l + (innerW - plotW) / 2;

  const mapX = (x: number) => offX + ((x - x0) / (x1 - x0)) * plotW;
  const mapY = (y: number) => PAD.t + (1 - (y - y0) / (y1 - y0)) * innerH;
  const baseY = mapY(Math.max(y0, Math.min(y1, 0)));

  const linePath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${mapX(p[0]).toFixed(1)},${mapY(p[1]).toFixed(1)}`).join(" ");
  const areaPath = (pts: [number, number][]) =>
    `${linePath(pts)} L${mapX(pts[pts.length - 1][0]).toFixed(1)},${baseY.toFixed(1)} L${mapX(pts[0][0]).toFixed(1)},${baseY.toFixed(1)} Z`;

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => PAD.t + f * innerH);
  const legend = data.series.filter((s) => s.label);

  return (
    <div className="wb-graph glass-panel">
      <div className="wb-graph-head">
        <span className="wb-graph-title">{data.title}</span>
        {legend.length > 0 && (
          <div className="wb-graph-legend">
            {legend.map((s) => (
              <span key={s.label} className="wb-graph-leg">
                <i style={{ background: PALETTE[s.color ?? "accent"].stroke }} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        className="wb-graph-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={data.title}
        preserveAspectRatio="xMidYMid meet"
      >
        <g className="wb-graph-grid">
          {gridYs.map((gy, i) => (
            <line key={i} x1={PAD.l} y1={gy.toFixed(1)} x2={W - PAD.r} y2={gy.toFixed(1)} />
          ))}
        </g>

        {data.zeroLine && y0 < 0 && y1 > 0 && (
          <line className="wb-graph-zero" x1={PAD.l} y1={baseY.toFixed(1)} x2={W - PAD.r} y2={baseY.toFixed(1)} />
        )}

        <line className="wb-graph-axis" x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} />
        <line className="wb-graph-axis" x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} />

        {isBars ? (
          <BarSeries data={data} mapY={mapY} baseY={baseY} />
        ) : (
          data.series.map((s, si) => {
            const col = PALETTE[s.color ?? "accent"];
            const gid = `${uid}-g${si}`;
            return (
              <g key={si}>
                {s.area && (
                  <>
                    <defs>
                      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={col.fill} />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath(s.points)} fill={`url(#${gid})`} />
                  </>
                )}
                {!s.noLine && (
                  <path
                    className={s.dashed ? "wb-graph-line-dashed" : "wb-graph-line"}
                    d={linePath(s.points)}
                    fill="none"
                    stroke={col.stroke}
                  />
                )}
                {s.dots &&
                  s.points.map((p, pi) => (
                    <circle key={pi} cx={mapX(p[0]).toFixed(1)} cy={mapY(p[1]).toFixed(1)} r={3} fill={col.stroke} />
                  ))}
              </g>
            );
          })
        )}

        {data.markers?.map((m, i) => {
          const col = PALETTE[m.color ?? "accent"];
          const cx = mapX(m.x).toFixed(1);
          const cy = mapY(m.y).toFixed(1);
          return (
            <g key={i}>
              <circle className="wb-graph-marker-ring" cx={cx} cy={cy} r={5} fill="none" stroke={col.stroke} />
              <circle cx={cx} cy={cy} r={4.5} fill={col.stroke} stroke="var(--color-eduverse-bg)" strokeWidth={1.5} />
            </g>
          );
        })}

        {data.yLabel && (
          <text
            className="wb-graph-axis-label"
            x={12}
            y={PAD.t + innerH / 2}
            transform={`rotate(-90 12 ${PAD.t + innerH / 2})`}
            textAnchor="middle"
          >
            {data.yLabel}
          </text>
        )}
        {data.xLabel && (
          <text className="wb-graph-axis-label" x={PAD.l + innerW / 2} y={H - 7} textAnchor="middle">
            {data.xLabel}
          </text>
        )}

        <text className="wb-graph-tick" x={PAD.l - 6} y={PAD.t + 4} textAnchor="end">
          {fmt(y1)}
        </text>
        <text className="wb-graph-tick" x={PAD.l - 6} y={H - PAD.b} textAnchor="end">
          {fmt(y0)}
        </text>

        {isBars &&
          data.categories?.map((c, i) => {
            const n = data.categories!.length;
            const cx = PAD.l + ((i + 0.5) / n) * innerW;
            return (
              <text key={i} className="wb-graph-tick" x={cx} y={H - PAD.b + 15} textAnchor="middle">
                {c}
              </text>
            );
          })}
      </svg>

      {data.note && <p className="wb-graph-note">{data.note}</p>}
    </div>
  );
}

function BarSeries({
  data,
  mapY,
  baseY,
}: {
  data: LabChartData;
  mapY: (y: number) => number;
  baseY: number;
}) {
  const s = data.series[0];
  if (!s) return null;
  const n = s.points.length;
  const innerW = W - PAD.l - PAD.r;
  const slot = innerW / n;
  const bw = slot * 0.5;
  return (
    <g>
      {s.points.map((p, i) => {
        const cx = PAD.l + (i + 0.5) * slot;
        const y = mapY(p[1]);
        const isLast = i === n - 1;
        const col = isLast ? PALETTE.accent : PALETTE.muted;
        return (
          <g key={i}>
            <rect
              x={cx - bw / 2}
              y={y}
              width={bw}
              height={Math.max(0, baseY - y)}
              rx={3}
              fill={col.fill}
              stroke={col.stroke}
            />
            <text className="wb-graph-tick" x={cx} y={y - 5} textAnchor="middle">
              {fmt(p[1])}
            </text>
          </g>
        );
      })}
    </g>
  );
}
