import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
  next: z.string().optional(),
});

function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  // same-origin relative path only
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — Master Lingo" },
      { name: "description", content: "Sign in or create your Master Lingo account to start learning French, German, or Japanese with AI." },
      { property: "og:title", content: "Sign in — Master Lingo" },
      { property: "og:description", content: "Sign in or create your Master Lingo account to start learning French, German, or Japanese with AI." },
      { property: "og:url", content: "https://masterlingo.lovable.app/auth" },
      { name: "twitter:title", content: "Sign in — Master Lingo" },
      { name: "twitter:description", content: "Sign in or create your Master Lingo account to start learning French, German, or Japanese with AI." },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const next = safeNext(search.next);

  // If already signed in, jump straight in (or to `next` if provided)
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (next) window.location.href = next;
        else navigate({ to: "/dashboard" });
      }
    });
  }, [pathname, navigate, next]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${next ?? "/dashboard"}`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Master Lingo!");
        if (next) window.location.href = next;
        else navigate({ to: "/onboarding" });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        if (next) window.location.href = next;
        else navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for the reset link.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const returnPath = next ?? "/dashboard";
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(returnPath)}`,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      toast.success("Signed in with Google");
      if (next) window.location.href = next;
      else navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="bg-aurora relative flex min-h-screen items-center justify-center px-4 py-10">
      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-brand via-french to-japanese">
          <Globe className="size-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-bold">Master Lingo</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? "Start your language journey in seconds." : mode === "forgot" ? "We'll email you a reset link." : "Continue your fluency streak."}
          </p>
        </div>

        {mode !== "forgot" && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full gap-2 rounded-full border-border bg-background/60 py-6 text-sm font-semibold backdrop-blur"
            >
              {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleEmail} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex Chen" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}
          {mode === "signin" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              Remember me
            </label>
          )}
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-brand py-6 font-semibold text-brand-foreground shadow-xl shadow-brand/25 hover:bg-brand/90">
            {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>Already have an account? <button onClick={() => setMode("signin")} className="font-semibold text-brand hover:underline">Sign in</button></>
          ) : mode === "signin" ? (
            <>New to Master Lingo? <button onClick={() => setMode("signup")} className="font-semibold text-brand hover:underline">Create account</button></>
          ) : (
            <button onClick={() => setMode("signin")} className="font-semibold text-brand hover:underline">Back to sign in</button>
          )}
        </div>
      </motion.div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
