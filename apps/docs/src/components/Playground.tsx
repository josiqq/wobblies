import {
  type AvatarOptions,
  type Background,
  createAvatar,
  MOODS,
  type Mood,
  SHAPES,
  type Shape,
  type TraitOverrides,
} from "@wobblies/core";
import "@wobblies/core/animations.css";
import { deriveTraits } from "@wobblies/core/internal";
import { Wobbly } from "@wobblies/react";
import { useId, useMemo, useState } from "react";
import { avatarToPng, download, type GridOptions, gridToPng, gridToSvg, slug } from "../lib/export";
import "../styles/playground.css";
import { Segmented } from "./Segmented";
import { LockButton, TraitSlider } from "./TraitSlider";

type TraitKey = keyof TraitOverrides;

const SHAPE_LABELS: Record<Shape, string> = {
  round: "Round",
  organic: "Organic",
  boxy: "Boxy",
  nub: "Nub",
  cloud: "Cloud",
  sun: "Sun",
};
const MOOD_LABELS: Record<Mood, string> = {
  idle: "Neutral",
  happy: "Happy",
  sad: "Sad",
  mad: "Mad",
};
const BACKGROUNDS: ReadonlyArray<readonly [Background, string]> = [
  ["none", "None"],
  ["circle", "Circle"],
  ["squircle", "Squircle"],
  ["square", "Square"],
];
const SLIDERS: ReadonlyArray<{ key: Exclude<TraitKey, "shape">; label: string }> = [
  { key: "hue", label: "Hue" },
  { key: "tone", label: "Tone" },
  { key: "eyeGap", label: "Eye gap" },
  { key: "eyeSize", label: "Eye size" },
  { key: "gaze", label: "Gaze" },
];
const DEFAULT_GRID_NAMES = ["ana", "bruno", "carla", "diego", "elena", "fede", "gabi", "hugo"];

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function snippet(
  name: string,
  mood: Mood,
  background: Background,
  animated: boolean,
  traits: TraitOverrides,
): string {
  const props = [`name="${name.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`];
  if (mood !== "idle") props.push(`mood="${mood}"`);
  if (background !== "circle") props.push(`background="${background}"`);
  if (animated) props.push("animated");
  const entries = Object.entries(traits).map(([k, v]) =>
    typeof v === "number" ? `${k}: ${round3(v)}` : `${k}: "${v}"`,
  );
  if (entries.length) props.push(`traits={{ ${entries.join(", ")} }}`);
  return `<Wobbly ${props.join(" ")} />`;
}

function SinglePanel() {
  const [name, setName] = useState("");
  const [seed, setSeed] = useState("");
  const [overrides, setOverrides] = useState<TraitOverrides>({});
  const [locked, setLocked] = useState<ReadonlySet<TraitKey>>(new Set());
  const [mood, setMood] = useState<Mood>("idle");
  const [background, setBackground] = useState<Background>("circle");
  const [animated, setAnimated] = useState(true);
  const nameId = useId();

  const effectiveSeed = seed || name || "avatar";
  const derived = useMemo(() => deriveTraits(effectiveSeed, overrides), [effectiveSeed, overrides]);
  const options: AvatarOptions = { mood, background, traits: overrides };

  const keepLocked = (o: TraitOverrides): TraitOverrides =>
    Object.fromEntries(Object.entries(o).filter(([k]) => locked.has(k as TraitKey)));

  const setTrait = <K extends TraitKey>(key: K, value: TraitOverrides[K]) =>
    setOverrides((o) => ({ ...o, [key]: value }));

  const toggleLock = (key: TraitKey) => {
    const next = new Set(locked);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
      // Freeze the current value so Roll keeps it.
      if (overrides[key] === undefined) setTrait(key, deriveTraits(effectiveSeed)[key] as never);
    }
    setLocked(next);
  };

  const stepShape = (dir: number) => {
    const idx = (SHAPES.indexOf(derived.shape) + dir + SHAPES.length) % SHAPES.length;
    setTrait("shape", SHAPES[idx]);
  };

  const onName = (value: string) => {
    setName(value);
    setSeed("");
    setOverrides(keepLocked);
  };
  const roll = () => {
    setSeed(crypto.getRandomValues(new Uint32Array(2)).join("-"));
    setOverrides(keepLocked);
  };
  const reset = () => {
    setSeed("");
    setOverrides(keepLocked);
  };

  const base = slug(name || "avatar");
  const downloadSvg = () =>
    download(createAvatar(effectiveSeed, { ...options, title: name }).svg, `${base}.svg`);
  const downloadPng = async (px: number) =>
    download(await avatarToPng(effectiveSeed, px, options), `${base}-${px}.png`);

  return (
    <div className="pg-panel">
      <div className="pg-preview-col">
        <div className="pg-preview">
          <Wobbly
            name={effectiveSeed}
            mood={mood}
            background={background}
            animated={animated}
            traits={overrides}
            title={name || "avatar"}
          />
        </div>
        <div className="pg-downloads">
          <button type="button" className="pg-btn" onClick={downloadSvg}>
            SVG
          </button>
          {[256, 512, 1024].map((px) => (
            <button key={px} type="button" className="pg-btn" onClick={() => downloadPng(px)}>
              PNG {px}
            </button>
          ))}
        </div>
      </div>

      <div className="pg-controls">
        <label className="pg-label" htmlFor={nameId}>
          Username or name
        </label>
        <input
          id={nameId}
          type="text"
          placeholder="@username"
          autoComplete="off"
          spellCheck={false}
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
        <p className="pg-hint">
          The same name always makes the same avatar. Roll picks a random one.
        </p>
        <div className="pg-row">
          <button type="button" className="pg-btn pg-primary" onClick={roll}>
            🎲 Roll
          </button>
          <button type="button" className="pg-btn" onClick={reset}>
            ↺ Back to name
          </button>
        </div>

        <div className="pg-card">
          <div className="pg-trait">
            <span>Shape</span>
            <div className="pg-stepper">
              <button
                type="button"
                className="pg-icon"
                aria-label="Previous shape"
                onClick={() => stepShape(-1)}
              >
                ‹
              </button>
              <span className="pg-shape-name">
                {SHAPE_LABELS[derived.shape]}
                {overrides.shape === undefined ? " · from name" : ""}
              </span>
              <button
                type="button"
                className="pg-icon"
                aria-label="Next shape"
                onClick={() => stepShape(1)}
              >
                ›
              </button>
            </div>
            <LockButton
              label="Shape"
              locked={locked.has("shape")}
              onToggle={() => toggleLock("shape")}
            />
          </div>
          {SLIDERS.map(({ key, label }) => (
            <TraitSlider
              key={key}
              id={`${nameId}-${key}`}
              label={label}
              value={derived[key]}
              locked={locked.has(key)}
              hue={key === "hue"}
              onChange={(v) => setTrait(key, v)}
              onToggleLock={() => toggleLock(key)}
            />
          ))}
        </div>

        <Segmented
          label="Mood"
          options={MOODS.map((m) => [m, MOOD_LABELS[m]] as const)}
          value={mood}
          onChange={setMood}
        />
        <Segmented
          label="Background"
          options={BACKGROUNDS}
          value={background}
          onChange={setBackground}
        />
        <label className="pg-check">
          <input
            type="checkbox"
            checked={animated}
            onChange={(e) => setAnimated(e.target.checked)}
          />{" "}
          Animate (blinking and breathing)
        </label>

        <pre className="pg-code">
          <code>{snippet(effectiveSeed, mood, background, animated, overrides)}</code>
        </pre>
      </div>
    </div>
  );
}

function GridPanel() {
  const [text, setText] = useState(DEFAULT_GRID_NAMES.join("\n"));
  const [cols, setCols] = useState(4);
  const [background, setBackground] = useState<Background>("circle");
  const namesId = useId();
  const colsId = useId();

  const names = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const grid: GridOptions = {
    names,
    cols: Math.max(1, Math.min(12, cols || 4)),
    cell: 160,
    gap: 16,
    background: "#ffffff",
  };

  return (
    <div className="pg-panel pg-panel-grid">
      <div className="pg-controls">
        <label className="pg-label" htmlFor={namesId}>
          Names (one per line)
        </label>
        <textarea
          id={namesId}
          rows={8}
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="pg-row">
          <label className="pg-inline" htmlFor={colsId}>
            Columns
            <input
              id={colsId}
              type="number"
              min={1}
              max={12}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            className="pg-btn"
            onClick={() => download(gridToSvg(grid, { background }), `avatars-${names.length}.svg`)}
          >
            Download SVG
          </button>
          <button
            type="button"
            className="pg-btn pg-primary"
            onClick={async () =>
              download(await gridToPng(grid, { background }), `avatars-${names.length}.png`)
            }
          >
            Download PNG
          </button>
        </div>
        <Segmented
          label="Background"
          options={BACKGROUNDS}
          value={background}
          onChange={setBackground}
        />
      </div>
      <div className="pg-grid" style={{ "--cols": grid.cols } as React.CSSProperties}>
        {names.map((n, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: names may repeat
          <figure key={`${i}-${n}`}>
            <Wobbly name={n} background={background} decorative />
            <figcaption>{n}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Interactive avatar editor: a single-avatar tab and a sheet (grid) tab. */
export function Playground() {
  const [tab, setTab] = useState<"single" | "grid">("single");
  const tabs = [
    ["single", "Single avatar"],
    ["grid", "Grid"],
  ] as const;
  return (
    <div className="pg">
      <div className="pg-tabs" role="tablist" aria-label="Playground mode">
        {tabs.map(([id, text]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`pg-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`pg-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const next = id === "single" ? "grid" : "single";
                setTab(next);
                document.getElementById(`pg-tab-${next}`)?.focus();
              }
            }}
          >
            {text}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="pg-panel-single"
        aria-labelledby="pg-tab-single"
        hidden={tab !== "single"}
      >
        <SinglePanel />
      </div>
      <div role="tabpanel" id="pg-panel-grid" aria-labelledby="pg-tab-grid" hidden={tab !== "grid"}>
        <GridPanel />
      </div>
    </div>
  );
}
