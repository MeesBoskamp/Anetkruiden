import { useLang, type Lang } from "@/lib/i18n";

const options: { value: Lang; label: string; full: string }[] = [
  { value: "nl", label: "NL", full: "Nederlands" },
  { value: "en", label: "EN", full: "English" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center gap-1 text-sm ${className}`}
      role="group"
      aria-label="Taal / Language"
    >
      {options.map((o, i) => (
        <span key={o.value} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          )}
          <button
            type="button"
            lang={o.value}
            aria-label={o.full}
            aria-pressed={lang === o.value}
            onClick={() => setLang(o.value)}
            className={
              lang === o.value
                ? "font-semibold underline underline-offset-4"
                : "opacity-70 hover:opacity-100"
            }
          >
            {o.label}
          </button>
        </span>
      ))}
    </div>
  );
}
