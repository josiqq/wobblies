import { SHAPES } from "@wobblies/core";
import { Wobbly } from "@wobblies/react";

export interface GalleryProps {
  count?: number;
}

/** A responsive grid of avatars cycling through every shape. */
export function Gallery({ count = 24 }: GalleryProps) {
  return (
    <div className="wobbly-gallery">
      {Array.from({ length: count }, (_, i) => (
        <Wobbly
          // biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
          key={i}
          name={`wobbly-${i}`}
          traits={{ shape: SHAPES[i % SHAPES.length] }}
          decorative
        />
      ))}
    </div>
  );
}
