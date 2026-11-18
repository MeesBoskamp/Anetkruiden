import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { adminBtn, inputClass } from "./ui";

type Column<T> = {
  key: keyof T & string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  /** Breedte in een raster van 6 kolommen. */
  span?: 1 | 2 | 3 | 4 | 5 | 6;
};

const SPAN = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
} as const;

/** Herhaalbare regels (bijv. kenmerken, inhoud, vragen) met toevoegen, verwijderen en volgorde. */
export function ListEditor<T extends Record<string, string>>({
  value,
  onChange,
  columns,
  empty,
  addLabel,
  max,
}: {
  value: T[];
  onChange: (next: T[]) => void;
  columns: Column<T>[];
  empty: T;
  addLabel: string;
  max?: number;
}) {
  const update = (i: number, key: keyof T, v: string) =>
    onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const move = (i: number, d: number) => {
    const next = [...value];
    const t = i + d;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2 border border-border bg-cream/30 p-3">
          <div className="grid flex-1 grid-cols-6 gap-2">
            {columns.map((col) => (
              <label key={col.key} className={`col-span-6 ${SPAN[col.span ?? 6]} space-y-1`}>
                <span className="text-xs font-semibold text-muted-foreground">{col.label}</span>
                {col.multiline ? (
                  <textarea
                    rows={2}
                    value={row[col.key] ?? ""}
                    placeholder={col.placeholder}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <input
                    value={row[col.key] ?? ""}
                    placeholder={col.placeholder}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex flex-col">
            <button
              type="button"
              aria-label="Omhoog"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              className="p-1.5 hover:bg-cream disabled:opacity-20"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Omlaag"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              className="p-1.5 hover:bg-cream disabled:opacity-20"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Verwijderen"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="p-1.5 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      {(max === undefined || value.length < max) && (
        <button
          type="button"
          className={adminBtn.ghost}
          onClick={() => onChange([...value, { ...empty }])}
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}
