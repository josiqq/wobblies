import { Wobbly } from "@wobblies/react";
import { useEffect, useRef, useState } from "react";

export interface PhotoFallbackProps {
  name: string;
  src?: string;
  size?: number;
}

/** Shows a photo and falls back to the deterministic avatar when it fails to load. */
export function PhotoFallback({ name, src, size = 72 }: PhotoFallbackProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A new src gets a fresh chance.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on src change
  useEffect(() => setFailed(false), [src]);

  // The server-rendered <img> may have failed before hydration, so React never saw onError.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-check when src changes
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) return <Wobbly name={name} size={size} />;
  return (
    <img
      ref={ref}
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ borderRadius: "50%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}
