import type { Background, Mood } from "@wobblies/core";
import "@wobblies/core/animations.css";
import { Wobbly } from "@wobblies/react";

export interface DemoProps {
  names?: string[];
  size?: number;
  mood?: Mood;
  background?: Background;
  animated?: boolean;
}

const DEFAULT_NAMES = ["ana", "bruno", "carla", "diego", "elena"];

/** A row of avatars, used for live examples in the docs. */
export function Demo({ names = DEFAULT_NAMES, size = 72, mood, background, animated }: DemoProps) {
  return (
    <div className="wobbly-demo">
      {names.map((name) => (
        <Wobbly
          key={name}
          name={name}
          size={size}
          mood={mood}
          background={background}
          animated={animated}
        />
      ))}
    </div>
  );
}
