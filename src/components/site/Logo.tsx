import { Link } from "@tanstack/react-router";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Het logo: ANET in Liberation Serif Italic met een korte lijn eronder.
 * Kleur volgt de tekstkleur van de omgeving (zwart op wit, wit op oranje).
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.name}, home`}
      className={cn("inline-flex flex-col items-center text-3xl leading-none", className)}
    >
      <span className="font-display italic tracking-wide">ANET</span>
      <span aria-hidden="true" className="mt-1.5 block h-px w-[2.2rem] bg-current" />
    </Link>
  );
}
