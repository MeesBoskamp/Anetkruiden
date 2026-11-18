import type { ReactNode } from "react";

import { STATUS_LABEL, STATUS_STYLE, type OrderStatus } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-card p-5 sm:p-6", className)}>
      {title && <h2 className="text-2xl">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className={title || description ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string | undefined;
  required?: boolean | undefined;
  hint?: ReactNode;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-brand-deep" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function Loading({ label = "Laden…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-16 text-muted-foreground" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      {children}
    </div>
  );
}

/** Kleine knoppen in beheerstijl (rustiger dan de grote winkelknoppen). */
export const adminBtn = {
  primary:
    "inline-flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40",
  danger:
    "inline-flex items-center justify-center gap-2 border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
};

export const inputClass =
  "w-full border border-input bg-white px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink disabled:opacity-60";
