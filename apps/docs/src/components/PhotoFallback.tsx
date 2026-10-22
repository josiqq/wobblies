import { Wobbly } from "@wobblies/react";
import { useState } from "react";

export interface PhotoFallbackProps {
  name: string;
  src?: string;
  size?: number;
}

/** Shows a photo and falls back to the deterministic avatar when it fails to load. */
export function PhotoFallback({ name, src, size = 72 }: PhotoFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Wobbly name={name} size={size} />;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ borderRadius: "50%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}
