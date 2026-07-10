import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Master Lingo" },
      { name: "description", content: "Set a new password for your Master Lingo account." },
      { property: "og:title", content: "Reset password — Master Lingo" },
      { property: "og:description", content: "Set a new password for your Master Lingo account." },
      { property: "og:url", content: "https://masterlingo.lovable.app/reset-password" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/reset-password" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-aurora flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h1 className="font-display text-3xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your new password below.</p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-brand py-6 font-semibold text-brand-foreground hover:bg-brand/90">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </main>
  );
}
