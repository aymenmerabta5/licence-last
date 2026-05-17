import { useCurrentFrame } from "remotion"
import {
  colors,
  drawLine,
  fadeIn,
  fonts,
  scaleIn,
  slideUp,
} from "../lib/animations"

export const SceneIntro = () => {
  const frame = useCurrentFrame()

  const logoOpacity = fadeIn(frame, 0, 25)
  const logoY = slideUp(frame, 0, 30, 24)
  const logoScale = scaleIn(frame, 0, 35)

  const volOpacity = fadeIn(frame, 18, 20)
  const volY = slideUp(frame, 18, 20, 12)

  const line1 = drawLine(frame, 12, 20)
  const line2 = drawLine(frame, 20, 20)

  const bottomOpacity = fadeIn(frame, 35, 20)

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
      {/* Ambient glow orbs — matching HeroSection dark mode */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.06,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.04,
          filter: "blur(120px)",
        }}
      />

      {/* Top decorative line */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          width: `${line1 * 140}px`,
          height: "1px",
          background: colors.border,
        }}
      />

      {/* Volume label */}
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: colors.primary,
          marginBottom: "28px",
          opacity: volOpacity,
          transform: `translateY(${volY}px)`,
        }}
      >
        Vol. I — 2025
      </div>

      {/* Main Logo */}
      <h1
        style={{
          fontFamily: fonts.serif,
          fontSize: "140px",
          fontWeight: 400,
          color: colors.heading,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          margin: 0,
          opacity: logoOpacity,
          transform: `translateY(${logoY}px) scale(${logoScale})`,
          textWrap: "balance" as const,
        }}
      >
        Stag<span style={{ color: colors.primary }}>.</span>io
      </h1>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          width: `${line2 * 140}px`,
          height: "1px",
          background: colors.border,
        }}
      />

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          fontFamily: fonts.sans,
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: colors.mutedFg,
          opacity: bottomOpacity,
        }}
      >
        A New Standard
      </div>
    </div>
  )
}
