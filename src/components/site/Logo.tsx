import { Link } from "@tanstack/react-router";

import { site } from "@/content/site";

/** Tijdelijk tekstlogo, wordt vervangen zodra het echte logo er is. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.name}, home`}
      className={`display inline-flex items-center gap-2 text-2xl tracking-wide ${className}`}
    >
      <span aria-hidden="true" className="inline-block size-2.5 bg-leaf" />
      {site.name}
    </Link>
  );
}
