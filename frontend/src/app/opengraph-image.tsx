import { ImageResponse } from "next/og";

export const alt = "EduVerse — See Your Code Run, Line by Line";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded Open Graph / social-share card, generated at build time. Kept to flat
 * inline styles (Satori requires explicit `display: flex` on multi-child nodes).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#0e111a",
        backgroundImage:
          "radial-gradient(900px 500px at 80% -10%, rgba(204,136,0,0.18), transparent)",
        color: "#f5f3ee",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "84px",
            height: "84px",
            borderRadius: "22px",
            background: "rgba(204,136,0,0.12)",
            border: "2px solid rgba(204,136,0,0.5)",
            color: "#cc8800",
            fontSize: "54px",
            fontWeight: 700,
          }}
        >
          E
        </div>
        <div style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-0.01em" }}>EduVerse</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: "76px", fontWeight: 700, lineHeight: 1.05, maxWidth: "960px" }}>
          See your code run, line by line.
        </div>
        <div
          style={{
            fontSize: "30px",
            color: "#b9b4a8",
            maxWidth: "920px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          A step-by-step code visualizer, daily challenges, and AI hints — Python, HTML, CSS, C++.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "24px",
          color: "#cc8800",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "999px",
            background: "#cc8800",
          }}
        />
        Learn by watching it execute
      </div>
    </div>,
    { ...size },
  );
}
