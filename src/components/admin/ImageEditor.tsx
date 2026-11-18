import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { errorMessage, uploadProductImage } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

import { inputClass } from "./ui";

export type ImageItem = { url: string; alt: string };

/** Foto's uploaden, ordenen (eerste = hoofdfoto), een omschrijving geven en verwijderen. */
export function ImageEditor({
  value,
  onChange,
  invalid,
}: {
  value: ImageItem[];
  onChange: (next: ImageItem[]) => void;
  invalid?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    const added: ImageItem[] = [];
    for (const file of list) {
      try {
        added.push({ url: await uploadProductImage(file), alt: "" });
      } catch (err) {
        toast.error(`${file.name}: ${errorMessage(err)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (added.length) onChange([...value, ...added]);
    if (input.current) input.current.value = "";
  }

  const move = (i: number, d: number) => {
    const next = [...value];
    const t = i + d;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.url + i} className="border border-border bg-card">
            <div className="relative aspect-square bg-cream">
              <img src={img.url} alt={img.alt} className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                  Hoofdfoto
                </span>
              )}
            </div>
            <div className="space-y-2 p-2">
              <input
                value={img.alt}
                onChange={(e) =>
                  onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))
                }
                placeholder="Wat staat erop? (voor zoekmachines en schermlezers)"
                aria-label={`Omschrijving foto ${i + 1}`}
                className={`${inputClass} text-xs`}
              />
              <div className="flex justify-between">
                <div className="flex">
                  <button
                    type="button"
                    aria-label="Naar links"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="p-1.5 hover:bg-cream disabled:opacity-20"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Naar rechts"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                    className="p-1.5 hover:bg-cream disabled:opacity-20"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Foto verwijderen"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="p-1.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files);
            }}
            className={cn(
              "flex aspect-square w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-card p-4 text-center text-sm hover:border-ink",
              invalid
                ? "border-destructive text-destructive"
                : "border-border text-muted-foreground",
            )}
          >
            <ImagePlus className="size-6" />
            {uploading > 0 ? `Uploaden… (${uploading})` : "Foto's toevoegen"}
            <span className="text-xs">JPG, PNG of WebP. Klik of sleep hierheen.</span>
          </button>
        </li>
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}
