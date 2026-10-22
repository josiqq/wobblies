import type { CSSProperties } from "react";

export interface TraitSliderProps {
  id: string;
  label: string;
  value: number;
  locked: boolean;
  onChange: (value: number) => void;
  onToggleLock: () => void;
  /** Tints the thumb with the current hue and shows the hue gradient track. */
  hue?: boolean;
}

/** LockButton is shared with the shape stepper. */
export function LockButton({
  label,
  locked,
  onToggle,
}: {
  label: string;
  locked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="pg-lock"
      aria-pressed={locked}
      aria-label={`Lock ${label}`}
      title={locked ? "Unlock" : "Keep when rolling"}
      onClick={onToggle}
    >
      {locked ? "🔒" : "🔓"}
    </button>
  );
}

/** A 0–1 trait slider with a lock that keeps the value across Roll. */
export function TraitSlider({
  id,
  label,
  value,
  locked,
  onChange,
  onToggleLock,
  hue,
}: TraitSliderProps) {
  const style = hue
    ? ({ "--thumb": `hsl(${Math.round(value * 360)} 70% 60%)` } as CSSProperties)
    : undefined;
  return (
    <div className="pg-trait">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={0.999}
        step={0.001}
        value={value}
        className={hue ? "pg-hue" : undefined}
        style={style}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <LockButton label={label} locked={locked} onToggle={onToggleLock} />
    </div>
  );
}
