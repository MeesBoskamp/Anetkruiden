import type { ReactNode } from "react";

/** Gemeenschappelijke opbouw voor contentpagina's: grote titel en leesbare tekstkolom. */
export function PageShell({
  title,
  intro,
  draft = false,
  children,
}: {
  title: string;
  intro?: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
      <header className="mb-12 border-b border-border pb-10">
        <h1 className="display text-6xl sm:text-8xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </header>
      {draft && (
        <p className="mb-10 border-l-4 border-clay bg-stone px-4 py-3 text-sm">
          Conceptversie: deze tekst is een voorbeeld en moet worden nagelopen en aangevuld voordat
          de webshop live gaat. Waarden tussen [haken] moeten nog worden ingevuld.
        </p>
      )}
      <div className="space-y-6 text-[17px] leading-relaxed [&_h2]:font-display [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-none [&_h2]:mt-12 [&_h2]:text-3xl [&_li]:ml-5 [&_li]:list-disc [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
