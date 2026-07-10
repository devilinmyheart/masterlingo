import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";

// The Supabase auth-oauth namespace is beta; typed shim keeps things clean.
type OAuthResult = {
  data?: {
    client?: { name?: string; redirect_uris?: string[] } | null;
    redirect_url?: string;
    redirect_to?: string;
    scope?: string;
  } | null;
  error?: { message: string } | null;
};
type OAuthHelpers = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
function oauth(): OAuthHelpers {
  return (supabase.auth as unknown as { oauth: OAuthHelpers }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: session lives in localStorage
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id:
      typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({
        to: "/auth",
        search: { mode: "signin", next },
      });
    }
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="bg-aurora flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel max-w-md rounded-3xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Authorization error</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an application";

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="bg-aurora flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-brand via-french to-japanese">
            <Globe className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Master Lingo
            </div>
            <div className="font-display text-lg font-bold">Connect an app</div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold">
          Connect {clientName} to your account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} will be able to use Master Lingo tools while you are
          signed in — including reading your vocabulary notebook and learning
          progress, and adding new words on your behalf.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          This does not bypass Master Lingo's permissions or backend policies.
          You can disconnect at any time from the connected app.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={() => decide(true)}
            disabled={busy !== null}
            className="w-full rounded-full bg-brand py-6 font-semibold text-brand-foreground shadow-xl shadow-brand/25 hover:bg-brand/90"
          >
            {busy === "approve" ? <Loader2 className="size-4 animate-spin" /> : "Approve"}
          </Button>
          <Button
            variant="outline"
            onClick={() => decide(false)}
            disabled={busy !== null}
            className="w-full rounded-full py-6 font-semibold"
          >
            {busy === "deny" ? <Loader2 className="size-4 animate-spin" /> : "Cancel connection"}
          </Button>
        </div>
      </div>
    </main>
  );
}
