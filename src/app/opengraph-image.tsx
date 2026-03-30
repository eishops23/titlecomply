import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "TitleComply — FinCEN Compliance Automation";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1E3A5F",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          TitleComply
        </div>
        <div
          style={{
            color: "#94A3B8",
            fontSize: 28,
            marginTop: 16,
          }}
        >
          FinCEN Compliance Automation for Title & Escrow
        </div>
      </div>
    ),
    { ...size },
  );
}
