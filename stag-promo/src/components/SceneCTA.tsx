import { useCurrentFrame } from "remotion";
import { fadeIn, slideUp, scaleIn, drawLine, colors, fonts } from "../lib/animations";

export const SceneCTA = () => {
  const frame = useCurrentFrame();

  const logoOpacity = fadeIn(frame, 8, 18);
  const logoY = slideUp(frame, 8, 18, 20);
  const logoScale = scaleIn(frame, 8, 20);

  const lineOpacity = fadeIn(frame, 10, 16);
  const lineWidth = drawLine(frame, 14, 20);

  const headlineOpacity = fadeIn(frame, 22, 18);
  const headlineY = slideUp(frame, 22, 18, 16);

  const ctaOpacity = fadeIn(frame, 34, 16);
  const ctaScale = scaleIn(frame, 34, 18);

  const urlOpacity = fadeIn(frame, 46, 16);
  const urlY = slideUp(frame, 46, 16, 10);

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
      {/* Strong ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.06,
          filter: "blur(140px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "20%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.04,
          filter: "blur(120px)",
        }}
      />

      {/* Decorative top line */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          width: `${lineWidth * 120}px`,
          height: "1px",
          background: colors.border,
          opacity: lineOpacity,
        }}
      />

      {/* Logo */}
      <h1
        style={{
          fontFamily: fonts.serif,
          fontSize: "96px",
          fontWeight: 400,
          color: colors.heading,
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          opacity: logoOpacity,
          transform: `translateY(${logoY}px) scale(${logoScale})`,
        }}
      >
        Stag<span style={{ color: colors.primary }}>.</span>io
      </h1>

      {/* Headline */}
      <p
        style={{
          marginTop: "20px",
          fontFamily: fonts.serif,
          fontSize: "28px",
          fontWeight: 400,
          color: colors.mutedFg,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        Your journey starts here
      </p>

      {/* CTA Button — editorial variant */}
      <div
        style={{
          marginTop: "36px",
          padding: "16px 40px",
          border: `2px solid ${colors.heading}`,
          background: "transparent",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.heading,
          }}
        >
          Explore Platform
        </span>
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          width: `${lineWidth * 100}px`,
          height: "1px",
          background: colors.border,
          opacity: lineOpacity,
        }}
      />

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          fontFamily: fonts.sans,
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.15em",
          color: colors.mutedFg,
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        stag.io
      </div>
    </div>
  );
};
