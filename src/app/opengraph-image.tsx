import { ImageResponse } from "next/og";
import { plate } from "@/lib/plates";
import { BETA_LABEL, PRODUCT_NAME, TAGLINE } from "@/lib/config";

export const alt = `${PRODUCT_NAME}: ${TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same dimetric plates as the mark and the hero, computed from lib/plates.ts.
export default function OG() {
  const ps = [0, 1, 2, 3].map((i) => plate(52, 28, 150, 70 + i * 46, 12));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a1326", color: "#eef2fa", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
            {PRODUCT_NAME}
            <span style={{ fontSize: 18, fontWeight: 500, color: "#ffe3a6", border: "1px solid #ffe3a655", borderRadius: 99, padding: "4px 14px" }}>{BETA_LABEL}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{TAGLINE}</div>
            <div style={{ fontSize: 28, color: "#a2b2d4", maxWidth: 640 }}>Escrow that releases funds when a verified fact says so.</div>
          </div>
          <div style={{ fontSize: 20, color: "#788bb4" }}>Proofs by Primus zkTLS · Mock USDC on Base Sepolia</div>
        </div>
        <svg width="320" height="420" viewBox="60 0 180 330" style={{ alignSelf: "center" }}>
          {[3, 2, 1, 0].map((i) => {
            const p = ps[i];
            const lit = i === 3;
            return (
              <g key={i}>
                <polygon points={p.left} fill="#1b2742" />
                <polygon points={p.right} fill="#0f1a30" />
                <polygon points={p.top} fill={lit ? "#ffe3a6" : "#22304f"} stroke={lit ? "#ffe3a6" : "#3a4a6b"} strokeWidth="1.5" />
              </g>
            );
          })}
          <rect x="149" y="10" width="3" height="300" rx="1.5" fill="#ffe3a6" />
        </svg>
      </div>
    ),
    size,
  );
}
