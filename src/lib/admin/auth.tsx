import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { getSupabase } from "@/lib/supabase";

export type AdminState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string }
  | { status: "admin"; email: string; session: Session };

/** Houdt bij of er iemand is ingelogd en of die persoon beheerder is. */
export function useAdmin() {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ status: "unavailable" });
      return;
    }
    let active = true;

    async function evaluate(session: Session | null) {
      if (!session) {
        if (active) setState({ status: "signed-out" });
        return;
      }
      const email = session.user.email ?? "";
      const { data, error } = await supabase!.rpc("anet_is_admin");
      if (!active) return;
      if (error || data !== true) setState({ status: "not-admin", email });
      else setState({ status: "admin", email, session });
    }

    supabase.auth.getSession().then(({ data }) => evaluate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Rechten opnieuw bepalen bij in- en uitloggen; tokenvernieuwing verandert niets.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Buiten de callback om, zodat Supabase niet blokkeert.
        setTimeout(() => evaluate(session), 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  return { state, signOut };
}
