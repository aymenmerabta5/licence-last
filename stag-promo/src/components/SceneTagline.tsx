import { useCurrentFrame } from "remotion"
import {
  colors,
  drawLine,
  fadeIn,
  fonts,
  scaleXReveal,
  slideUp,
} from "../lib/animations"

export const SceneTagline = () => {
  const frame = useCurrentFrame()

  const sepOpacity = fadeIn(frame, 0, 18)
  const sepLine = drawLine(frame, 0, 20)

  const word1 = fadeIn(frame, 12, 20)
  const word1Y = slideUp(frame, 12, 22, 28)

  const word2 = fadeIn(frame, 22, 20)
  const word2Y = slideUp(frame, 22, 22, 28)

  const word3 = fadeIn(frame, 32, 20)
  const word3Y = slideUp(frame, 32, 22, 28)
  const underlineScale = scaleXReveal(frame, 48, 18)

  const descOpacity = fadeIn(frame, 50, 20)
  const descY = slideUp(frame, 50, 20, 16)

  const ctaOpacity = fadeIn(frame, 62, 18)
  const ctaY = slideUp(frame, 62, 18, 12)

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
          top: "30%",
          left: "60%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.05,
          filter: "blur(100px)",
        }}
      />

      {/* Section separator */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          width: "min(640px, 80%)",
          opacity: sepOpacity,
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
            whiteSpace: "nowrap",
          }}
        >
          Editorial
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: colors.border,
            transformOrigin: "left",
            transform: `scaleX(${sepLine})`,
          }}
        />
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(48px, 6vw, 84px)",
            fontWeight: 400,
            color: colors.heading,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            opacity: word1,
            transform: `translateY(${word1Y}px)`,
          }}
        >
          The Future
        </span>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(48px, 6vw, 84px)",
            fontWeight: 400,
            color: colors.heading,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            opacity: word2,
            transform: `translateY(${word2Y}px)`,
          }}
        >
          of{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              color: colors.primary,
            }}
          >
            Internship
            {/* ScaleX underline matching HeroContent */}
            <span
              style={{
                position: "absolute",
                bottom: "-4px",
                left: 0,
                right: 0,
                height: "3px",
                background: colors.primary,
                transformOrigin: "left",
                transform: `scaleX(${underlineScale})`,
              }}
            />
          </span>
        </span>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(48px, 6vw, 84px)",
            fontWeight: 400,
            color: colors.heading,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            opacity: word3,
            transform: `translateY(${word3Y}px)`,
          }}
        >
          Discovery
        </span>
      </div>

      {/* Descriptions */}
      <div
        style={{
          marginTop: "48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          maxWidth: "640px",
          padding: "0 24px",
          opacity: descOpacity,
          transform: `translateY(${descY}px)`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "14px",
            fontWeight: 300,
            lineHeight: 1.7,
            color: colors.mutedFg,
            textWrap: "balance" as const,
          }}
        >
          A centralized platform bridging the gap between universities and
          enterprises. Skill-based matching, automated document generation, and
          placement tracking.
        </p>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "14px",
            fontWeight: 300,
            lineHeight: 1.7,
            color: colors.mutedFg,
            textWrap: "balance" as const,
          }}
        >
          Within the framework of MESRS strategy to strengthen the
          University-Enterprise link, Stag digitizes the entire internship
          lifecycle.
        </p>
      </div>

      {/* CTA Row */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        {/* Editorial button style */}
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.heading,
            padding: "14px 32px",
            border: `2px solid ${colors.heading}`,
            background: "transparent",
          }}
        >
          Explore Platform
        </div>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "12px",
            fontWeight: 500,
            color: colors.mutedFg,
            letterSpacing: "0.05em",
          }}
        >
          Free for Students
        </span>
      </div>
    </div>
  )
}
