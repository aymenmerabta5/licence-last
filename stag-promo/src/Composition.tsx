import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fadeOut } from "./lib/animations";
import { SceneIntro } from "./components/SceneIntro";
import { SceneTagline } from "./components/SceneTagline";
import { SceneMarquee } from "./components/SceneMarquee";
import { SceneFeatures } from "./components/SceneFeatures";
import { SceneStats } from "./components/SceneStats";
import { SceneCTA } from "./components/SceneCTA";

interface FadeOutWrapperProps {
  children: React.ReactNode;
  fadeStart: number;
  fadeDuration: number;
}

const FadeOutWrapper = ({ children, fadeStart, fadeDuration }: FadeOutWrapperProps) => {
  const frame = useCurrentFrame();
  const opacity = fadeOut(frame, fadeStart, fadeDuration);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {children}
    </div>
  );
};

export const StagPromo = () => {
  const fps = 30;

  // Scene timing with 1-second overlaps for crossfades
  const s1 = { start: 0,       dur: fps * 4 };   // Intro (4s)
  const s2 = { start: fps * 3, dur: fps * 5 };   // Tagline (5s, overlaps 1s)
  const s3 = { start: fps * 6, dur: fps * 4 };   // Marquee (4s, overlaps 2s)
  const s4 = { start: fps * 9, dur: fps * 5 };   // Features (5s, overlaps 1s)
  const s5 = { start: fps * 12, dur: fps * 5 };  // Stats (5s, overlaps 2s)
  const s6 = { start: fps * 15, dur: fps * 5 };  // CTA (5s, overlaps 2s)

  const t = fps * 0.6; // transition duration (0.6s)

  return (
    <AbsoluteFill style={{ background: "oklch(0.145 0.01 60)" }}>
      {/* Scene 1: Intro Logo */}
      <Sequence from={s1.start} durationInFrames={s1.dur} layout="none">
        <FadeOutWrapper fadeStart={s1.dur - t} fadeDuration={t}>
          <SceneIntro />
        </FadeOutWrapper>
      </Sequence>

      {/* Scene 2: Tagline */}
      <Sequence from={s2.start} durationInFrames={s2.dur} layout="none">
        <FadeOutWrapper fadeStart={s2.dur - t} fadeDuration={t}>
          <SceneTagline />
        </FadeOutWrapper>
      </Sequence>

      {/* Scene 3: Marquee Ribbon */}
      <Sequence from={s3.start} durationInFrames={s3.dur} layout="none">
        <FadeOutWrapper fadeStart={s3.dur - t} fadeDuration={t}>
          <SceneMarquee />
        </FadeOutWrapper>
      </Sequence>

      {/* Scene 4: Features */}
      <Sequence from={s4.start} durationInFrames={s4.dur} layout="none">
        <FadeOutWrapper fadeStart={s4.dur - t} fadeDuration={t}>
          <SceneFeatures />
        </FadeOutWrapper>
      </Sequence>

      {/* Scene 5: Stats */}
      <Sequence from={s5.start} durationInFrames={s5.dur} layout="none">
        <FadeOutWrapper fadeStart={s5.dur - t} fadeDuration={t}>
          <SceneStats />
        </FadeOutWrapper>
      </Sequence>

      {/* Scene 6: CTA */}
      <Sequence from={s6.start} durationInFrames={s6.dur} layout="none">
        <FadeOutWrapper fadeStart={s6.dur - t} fadeDuration={t}>
          <SceneCTA />
        </FadeOutWrapper>
      </Sequence>
    </AbsoluteFill>
  );
};
