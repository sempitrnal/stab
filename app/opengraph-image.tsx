import { ImageResponse } from "next/og";

export const alt = "STAB · merch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share card for the site and any page without its own photo.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f1ea",
        color: "#1d1d1f",
      }}
    >
      <div style={{ fontSize: 220, fontWeight: 700, letterSpacing: -6 }}>
        STAB
      </div>
      <div style={{ fontSize: 40, color: "#6e6e73" }}>
        hostile youth records
      </div>
    </div>,
    size,
  );
}
