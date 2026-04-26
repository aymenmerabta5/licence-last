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
        className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/5 blur-[100px] rounded-full"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/3 blur-[80px] rounded-full"
      />

      {/* Subtle Grid / Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-100 brightness-100 mix-blend-multiply" />

      {/* Horizontal Line Accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </div>
  )
}
