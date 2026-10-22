import { createAvatar } from "@wobblies/core";
import { Wobbly } from "@wobblies/react";

export interface AvatarGroupProps {
  names: string[];
  size?: number;
  max?: number;
}

/** Overlapping avatar stack; each ring uses the avatar's own background colour. */
export function AvatarGroup({ names, size = 48, max = 4 }: AvatarGroupProps) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBlock: "1rem" }}>
      {shown.map((name, i) => (
        <Wobbly
          // biome-ignore lint/suspicious/noArrayIndexKey: names may repeat; list is static
          key={`${i}-${name}`}
          name={name}
          size={size}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.3,
            borderRadius: "50%",
            boxShadow: `0 0 0 3px ${createAvatar(name).palette.bg}`,
          }}
        />
      ))}
      {extra > 0 && (
        <span
          role="img"
          aria-label={`and ${extra} more`}
          style={{
            marginLeft: -size * 0.3,
            width: size,
            height: size,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: size * 0.32,
            background: "var(--sl-color-gray-5)",
            color: "var(--sl-color-white)",
            boxShadow: "0 0 0 3px var(--sl-color-bg)",
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
