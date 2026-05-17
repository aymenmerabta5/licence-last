import { useCurrentFrame } from "remotion"
import { colors, fadeIn, fonts } from "../lib/animations"

const items = [
  "INTERNSHIP MATCHING",
  "DIGITAL CV",
  "SMART FILTERS",
  "AUTO DOCUMENTS",
  "SKILL TAGS",
  "REAL-TIME TRACKING",
]

export const SceneMarquee = () => {
  const frame = useCurrentFrame()

  const barOpacity = fadeIn(frame, 0, 20)
  const scrollOffset = (frame * 2.5) % 800

  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "20%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.04,
          filter: "blur(120px)",
        }}
      />

      {/* Section label */}
      <div
        style={{
          marginBottom: "48px",
          opacity: fadeIn(frame, 5, 18),
          transform: `translateY(${20 - fadeIn(frame, 5, 18) * 20}px)`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.primary,
          }}
        >
          Capabilities
        </span>
      </div>

      {/* Dark ribbon bar with marquee */}
      <div
        style={{
          width: "100%",
          padding: "16px 0",
          background: colors.foreground,
          opacity: barOpacity,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
            whiteSpace: "nowrap",
            willChange: "transform",
            transform: `translateX(-${scrollOffset}px)`,
          }}
        >
          {repeated.map((txt, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "48px" }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: colors.bg,
                }}
              >
                {txt}
              </span>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: colors.primary,
                  flexShrink: 0,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Infinity watermark — from HowItWorksSection */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "-4%",
          fontFamily: fonts.serif,
          fontSize: "320px",
          fontWeight: 700,
          lineHeight: 1,
          color: colors.heading,
          opacity: 0.015,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        &#x221e;
      </div>
    </div>
  )
}
