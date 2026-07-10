import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Home, BookOpen, Sparkles, Library, User as UserIcon, LogOut, Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/vocabulary", label: "Vocabulary", icon: Library },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

function AuthedLayout() {
  const { user } = Route.useRouteContext() as { user: User };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: onboardingRow, isLoading: onboardingLoading } = useQuery({
    queryKey: ["onboarding-status", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_onboarding").select("language").eq("user_id", user.id).maybeSingle();
      return data ?? null;
    },
  });
  const needsOnboarding = !onboardingLoading && !onboardingRow;

  const { data: profileRow } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      return data ?? null;
    },
  });

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") navigate({ to: "/onboarding" });
  }, [needsOnboarding, pathname, navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const meta = user.user_metadata ?? {};
  const displayName =
    (profileRow?.display_name as string | undefined) ??
    (meta.display_name as string | undefined) ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "You";

  return (
    <div className="bg-aurora min-h-screen">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/40 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-tr from-brand via-french to-japanese">
            <Globe className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold">LingoMaster</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-accent">
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background/60 p-6 backdrop-blur-xl md:flex">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-brand via-french to-japanese shadow-lg shadow-brand/20">
              <Globe className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold">LingoMaster</span>
          </Link>
          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-brand text-brand-foreground shadow-md shadow-brand/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <Button onClick={signOut} variant="ghost" size="sm" className="mt-3 w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-x-0 top-[57px] z-40 border-b border-border bg-background/95 p-4 backdrop-blur md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                    pathname.startsWith(item.to) ? "bg-brand text-brand-foreground" : "hover:bg-accent"
                  )}
                >
                  <item.icon className="size-4" /> {item.label}
                </Link>
              ))}
              <Button onClick={signOut} variant="ghost" className="mt-2 justify-start gap-2">
                <LogOut className="size-4" /> Sign out
              </Button>
            </nav>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
