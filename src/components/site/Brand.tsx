import { Fragment, type ReactNode } from "react";

/** De merknaam zoals in het logo: ANET in Liberation Serif Italic. */
export function Brand() {
  return <span className="font-display italic">ANET</span>;
}

/** Zet elke "ANET" in een lopende tekst cursief, zoals in het logo. */
export function withBrand(text: string): ReactNode {
  const parts = text.split(/\bANET\b/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <Brand />}
    </Fragment>
  ));
}
