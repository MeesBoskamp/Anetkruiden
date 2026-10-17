import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { announcements } from "@/content/site";
import { useTr } from "@/lib/i18n";

export function AnnouncementBar() {
  const tr = useTr();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = announcements.length;
  const current = announcements[index];

  useEffect(() => {
    if (paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => window.clearInterval(id);
  }, [paused, total]);

  const go = (step: number) => setIndex((i) => (i + step + total) % total);

  return (
    <div
      className="bg-cream text-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between px-3 sm:px-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={tr({ nl: "Vorig bericht", en: "Previous message" })}
          className="p-2 opacity-70 hover:opacity-100"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-center text-[13px]" aria-live="polite">
          {current ? tr(current) : null}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={tr({ nl: "Volgend bericht", en: "Next message" })}
          className="p-2 opacity-70 hover:opacity-100"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
