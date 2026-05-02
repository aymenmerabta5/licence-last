import { useCurrentFrame } from "remotion";
import { fadeIn, slideUp, countUp, colors, fonts } from "../lib/animations";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

const StatItem = ({ value, suffix, label, delay }: StatItemProps) => {
  const frame = useCurrentFrame();

  const itemOpacity = fadeIn(frame, delay, 16);
  const itemY = slideUp(frame, delay, 18, 20);
  const current = countUp(frame, delay + 8, 36, 0, value);

  const display = Math.round(current).toLocaleString();

  return (
    <div
      style={{
        textAlign: "center",
        opacity: itemOpacity,
        transform: `translateY(${itemY}px)`,
        minWidth: "200px",
        padding: "32px 24px",
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: "56px",
          fontWeight: 400,
          color: colors.heading,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {display}
        <span style={{ color: colors.primary }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: colors.mutedFg,
          marginTop: "12px",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const SceneStats = () => {
  const frame = useCurrentFrame();

  const titleOpacity = fadeIn(frame, 0, 16);
  const titleY = slideUp(frame, 0, 16, 14);

  const stats: StatItemProps[] = [
    { value: 2500, suffix: "+", label: "Students Connected", delay: 12 },
    { value: 350, suffix: "+", label: "Partner Companies", delay: 18 },
    { value: 45, suffix: "", label: "Universities", delay: 24 },
    { value: 96, suffix: "%", label: "Placement Rate", delay: 30 },
  ];

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
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: colors.primary,
          opacity: 0.04,
          filter: "blur(120px)",
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
          Impact
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
          By the Numbers
        </h2>
      </div>

      {/* Stats grid — matching StatsBar rounded-3xl card */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          background: colors.card,
          overflow: "hidden",
          boxShadow: "0 4px 40px -12px rgba(0,0,0,0.2)",
        }}
      >
        {stats.map((s, i) => (
          <StatItem key={i} {...s} />
        ))}
      </div>
    </div>
  );
};
