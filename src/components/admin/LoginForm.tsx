import { useState, type FormEvent } from "react";

import { getSupabase } from "@/lib/supabase";

import { adminBtn, ErrorNote, Field, inputClass } from "./ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "E-mailadres of wachtwoord klopt niet."
          : error.message.includes("Email not confirmed")
            ? "Je e-mailadres is nog niet bevestigd. Kijk in je mailbox."
            : error.message,
      );
    }
  }

  async function forgot() {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!email.trim()) {
      setError("Vul eerst je e-mailadres in.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/beheer/wachtwoord`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else
      setInfo(
        "Als dit adres bij ons bekend is, krijg je een e-mail om een nieuw wachtwoord in te stellen.",
      );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 border border-border bg-card p-8"
      >
        <div>
          <p className="eyebrow text-muted-foreground">Beheer</p>
          <h1 className="mt-2 text-4xl">Inloggen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Alleen voor beheerders van <span className="font-display italic">ANET</span>.
          </p>
        </div>
        <Field label="E-mailadres" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Wachtwoord" htmlFor="login-password">
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        {info && <p className="bg-cream p-3 text-sm">{info}</p>}
        <button type="submit" disabled={busy} className={`${adminBtn.primary} w-full py-3`}>
          {busy ? "Bezig…" : "Inloggen"}
        </button>
        <button
          type="button"
          onClick={forgot}
          disabled={busy}
          className="w-full text-center text-sm underline underline-offset-4"
        >
          Wachtwoord vergeten?
        </button>
      </form>
    </div>
  );
}
