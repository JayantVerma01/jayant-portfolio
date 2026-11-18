import { ImageResponse } from "next/og";

export const alt = "Jayant Verma — Full Stack & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #11142a 0%, #0b0d17 60%, #07080f 100%)",
          color: "#ece8df",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 6, color: "#a9a79f" }}>
          <span>PORTFOLIO / 2026</span>
          <span style={{ color: "#34d399" }}>● OPEN TO WORK</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 1, letterSpacing: -4 }}>
            Jayant&nbsp;<span style={{ color: "#8b6dff" }}>Verma</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 44, color: "#a9a79f" }}>
            Full Stack &amp; AI Engineer · Next.js · Node.js · RAG
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24 }}>
          {["Next.js", "Node.js", "TypeScript", "LangGraph", "FastAPI"].map((t) => (
            <span
              key={t}
              style={{ padding: "8px 22px", border: "2px solid #3a3f66", borderRadius: 999, color: "#ece8df" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
