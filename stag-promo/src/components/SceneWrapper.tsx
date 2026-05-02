import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut } from "../lib/animations";

interface SceneWrapperProps {
  children: React.ReactNode;
  exitStart?: number;
  exitDuration?: number;
}

export const SceneWrapper = ({
  children,
  exitStart,
  exitDuration,
}: SceneWrapperProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const start = exitStart ?? fps * 3;
  const duration = exitDuration ?? fps * 0.5;
  const exitOpacity =
    exitStart !== undefined ? fadeOut(frame, start, duration) : 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: exitOpacity,
      }}
    >
      {children}
    </div>
  );
};
