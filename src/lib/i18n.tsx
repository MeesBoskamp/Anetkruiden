import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "nl" | "en";

/** Tekst met Nederlandse basis en optionele Engelse vertaling. Ontbreekt EN, dan valt de site terug op NL. */
export type Text = { nl: string; en?: string };

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void };

const LanguageContext = createContext<LanguageContextValue>({
  lang: "nl",
  setLang: () => {},
});

const STORAGE_KEY = "anetkruiden-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  // Voorkeur pas na het laden lezen, zodat server en browser dezelfde eerste weergave hebben.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "nl") setLangState(stored);
    } catch {
      /* opslag niet beschikbaar: blijf bij Nederlands */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* negeren */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

/** Kies de tekst in de huidige taal. Gebruik: const tr = useTr(); tr({ nl: "Winkelmand", en: "Cart" }) */
export function useTr() {
  const { lang } = useLang();
  return useCallback((text: Text) => (lang === "en" && text.en ? text.en : text.nl), [lang]);
}
