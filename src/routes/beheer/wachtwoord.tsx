import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminPage, adminBtn, ErrorNote, Field, inputClass, Panel } from "@/components/admin/ui";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/beheer/wachtwoord")({
  component: Wachtwoord,
});

function Wachtwoord() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) return setError("Kies een wachtwoord van minimaal 10 tekens.");
    if (password !== repeat) return setError("De wachtwoorden zijn niet gelijk.");
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    toast.success("Wachtwoord gewijzigd");
    navigate({ to: "/beheer" });
  }

  return (
    <AdminPage title="Wachtwoord wijzigen">
      <Panel className="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nieuw wachtwoord" htmlFor="pw1" hint="Minimaal 10 tekens.">
            <input
              id="pw1"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Herhaal wachtwoord" htmlFor="pw2">
            <input
              id="pw2"
              type="password"
              autoComplete="new-password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className={inputClass}
            />
          </Field>
          {error && <ErrorNote>{error}</ErrorNote>}
          <button type="submit" className={adminBtn.primary} disabled={busy}>
            {busy ? "Bezig…" : "Opslaan"}
          </button>
        </form>
      </Panel>
    </AdminPage>
  );
}
