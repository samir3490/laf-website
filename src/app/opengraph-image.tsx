import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lata Agrawal Foundation — Education & Community Programs";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a1f30 0%, #1a3348 50%, #0a1f30 100%)",
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            background: "#faf8f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            fontSize: 64,
          }}
        >
          📖
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#faf8f4",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Lata Agrawal Foundation
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#c19a4b",
            marginTop: 20,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Education, healthcare, and community programs across India
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(250,248,244,0.75)",
            marginTop: 28,
          }}
        >
          agrawalfoundation.org
        </div>
      </div>
    ),
    { ...size }
  );
}
