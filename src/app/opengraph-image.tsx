import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(67, 110, 201, 0.34), transparent 35%), radial-gradient(circle at 78% 22%, rgba(34, 211, 238, 0.2), transparent 28%), linear-gradient(180deg, #060910 0%, #09111d 100%)",
          color: "#f5f7ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 40,
            border: "1px solid rgba(163, 180, 225, 0.18)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            maskImage:
              "radial-gradient(circle at center, black 24%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "68px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#7dd3fc",
              }}
            >
              Axion Technologies
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 860,
                fontSize: 74,
                lineHeight: 1.04,
                fontWeight: 700,
              }}
            >
              Modern websites, automation, and practical AI for small business.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#cad3ea",
            }}
          >
            <div style={{ display: "flex" }}>axiontechnologies.ca</div>
            <div style={{ display: "flex" }}>
              Websites • Automation • AI Systems
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
