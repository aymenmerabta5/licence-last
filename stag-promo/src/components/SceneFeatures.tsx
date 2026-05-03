import { useCurrentFrame } from "remotion"
import { fadeIn, slideUp, scaleIn, colors, fonts } from "../lib/animations"

interface CardProps {
  num: string
  title: string
  desc: string
  delay: number
}

const FeatureCard = ({ num, title, desc, delay }: CardProps) => {
  const frame = useCurrentFrame()

  const cardOpacity = fadeIn(frame, delay, 18)
  const cardY = slideUp(frame, delay, 20, 24)
  const cardScale = scaleIn(frame, delay, 22)

  return (
    <div
      style={{
        width: "300px",
        padding: "32px",
        border: `1px solid ${colors.border}`,
        borderRadius: "24px",
        background: colors.card,
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: "40px",
          fontWeight: 400,
          color: colors.primary,
          lineHeight: 1,
        }}
      >
        {num}
      </div>
      <h3
        style={{
          fontFamily: fonts.sans,
          fontSize: "16px",
          fontWeight: 600,
          color: colors.heading,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "13px",
          fontWeight: 300,
          lineHeight: 1.7,
          color: colors.mutedFg,
        }}
      >
        {desc}
      </p>
    </div>
  )
}

export const SceneFeatures = () => {
  const frame = useCurrentFrame()

  const titleOpacity = fadeIn(frame, 0, 18)
  const titleY = slideUp(frame, 0, 18, 16)

  const features: CardProps[] = [
    {
      num: "01",
      title: "Student Space",
      desc: "Build your profile, tag skills, connect GitHub. Search and apply with smart filters.",
      delay: 14,
    },
    {
      num: "02",
      title: "Company Portal",
      desc: "Publish offers, track candidates, accept talent. One click triggers the full workflow.",
      delay: 24,
    },
    {
      num: "03",
      title: "Admin Dashboard",
      desc: "Validate placements, generate official PDFs, access global placement analytics.",
      delay: 34,
    },
  ]

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
        gap: "48px",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.05,
          filter: "blur(100px)",
        }}
      />

      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.primary,
            marginBottom: "14px",
          }}
        >
          Platform
        </div>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(36px, 4vw, 52px)",
            fontWeight: 400,
            color: colors.heading,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Three Pillars
        </h2>
      </div>

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "stretch",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {features.map((f) => (
          <FeatureCard key={f.num} {...f} />
        ))}
      </div>
    </div>
  )
}
