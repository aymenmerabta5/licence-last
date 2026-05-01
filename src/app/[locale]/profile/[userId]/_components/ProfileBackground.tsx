"use client"

import * as motion from "motion/react-client"

export function ProfileBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#faf9f6]">
      {/* Soft Warm Editorial Glows */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] end-[-5%] w-[60%] h-[60%] bg-primary/5 blur-[100px] rounded-full"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] start-[-5%] w-[50%] h-[50%] bg-primary/3 blur-[80px] rounded-full"
      />
      <motion.div
        animate={{
          opacity: [0.15, 0.3, 0.15],
          x: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] start-[20%] w-[30%] h-[30%] bg-primary/[0.03] blur-[120px] rounded-full"
      />

      {/* Editorial Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Subtle Vertical Accent Lines */}
      <div className="absolute top-0 start-[15%] w-px h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent hidden 2xl:block" />
      <div className="absolute top-0 end-[15%] w-px h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent hidden 2xl:block" />

      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.025] mix-blend-multiply">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Top Horizontal Line Accent */}
      <div className="absolute top-0 start-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </div>
  )
}
