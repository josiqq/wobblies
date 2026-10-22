export interface SegmentedProps<T extends string> {
  label: string;
  options: ReadonlyArray<readonly [value: T, label: string]>;
  value: T;
  onChange: (value: T) => void;
}

/** A row of toggle buttons where exactly one option is pressed. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="pg-group">
      <legend className="pg-label">{label}</legend>
      <div className="pg-seg">
        {options.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
