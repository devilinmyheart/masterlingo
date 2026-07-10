import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGE_LIST } from "@/data/curriculum";
import { Flame, Trophy, BookOpen, Zap, Clock, Award } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — LingoMaster" },
      { name: "description", content: "Manage your LingoMaster profile, display name, and view your learning stats and achievements." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/profile" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Profile,
});

const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const [prof, prog, onb] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_onboarding").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    return { user, profile: prof.data, progress: prog.data, onboarding: onb.data };
  },
});

function Profile() {
  const { data } = useQuery(profileQuery);
  const [name, setName] = useState(data?.profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  if (!data) return null;

  const p = data.progress;
  const language = LANGUAGE_LIST.find((l) => l.id === data.onboarding?.language) ?? LANGUAGE_LIST[0];

  async function saveName() {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: data.user.id, display_name: name });
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setSaving(false);
  }

  const stats = [
    { icon: Zap, label: "Total XP", value: (p?.xp ?? 0).toLocaleString(), accent: "text-brand bg-brand-soft" },
    { icon: Flame, label: "Current streak", value: `${p?.streak_days ?? 0}d`, accent: "text-japanese bg-japanese-soft" },
    { icon: Trophy, label: "Longest streak", value: `${p?.longest_streak ?? 0}d`, accent: "text-german-ink bg-german-soft" },
    { icon: BookOpen, label: "Lessons", value: `${p?.lessons_completed ?? 0}`, accent: "text-french bg-french-soft" },
    { icon: Clock, label: "Minutes studied", value: `${p?.minutes_studied ?? 0}`, accent: "text-brand bg-brand-soft" },
    { icon: Award, label: "Words learned", value: `${p?.words_learned ?? 0}`, accent: "text-french bg-french-soft" },
  ];

  const initial = (name || data.user.email || "U")[0].toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <div className="glass-panel rounded-3xl p-8 shadow-xl md:p-10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid size-24 place-items-center rounded-full bg-gradient-to-tr from-brand via-french to-japanese font-display text-4xl font-bold text-white shadow-xl">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Learner</div>
            <h1 className="mt-1 font-display text-3xl font-bold">{name || data.user.email}</h1>
            <div className="mt-1 text-sm text-muted-foreground">{data.user.email}</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
              <span className="text-lg">{language.flag}</span> Learning {language.nativeName}
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Your stats</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-5 shadow-sm">
            <div className={`grid size-10 place-items-center rounded-xl ${s.accent}`}>
              <s.icon className="size-5" />
            </div>
            <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Account</h2>
      <div className="glass-panel mt-4 space-y-4 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button onClick={saveName} disabled={saving} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
