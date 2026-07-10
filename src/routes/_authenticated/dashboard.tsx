import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CURRICULUM, LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { Flame, Trophy, BookOpen, Zap, Sparkles, ArrowRight, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LingoMaster" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Dashboard,
});

const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");

    const [onb, prog, recent] = await Promise.all([
      supabase.from("user_onboarding").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("lesson_completions").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20),
    ]);

    return {
      user,
      onboarding: onb.data,
      progress: prog.data,
      recent: recent.data ?? [],
    };
  },
});

const LANG_ACCENT: Record<LanguageId, { chip: string; bar: string; ring: string; ink: string }> = {
  french: { chip: "bg-french-soft", bar: "bg-french", ring: "ring-french/30", ink: "text-french" },
  german: { chip: "bg-german-soft", bar: "bg-german", ring: "ring-german/30", ink: "text-german-ink" },
  japanese: { chip: "bg-japanese-soft", bar: "bg-japanese", ring: "ring-japanese/30", ink: "text-japanese" },
};

function Dashboard() {
  const { data } = useQuery(dashboardQuery);
  if (!data) return null;

  const language = (data.onboarding?.language ?? "french") as LanguageId;
  const course = CURRICULUM[language];
  const accent = LANG_ACCENT[language];
  const displayName = (data.user.user_metadata?.display_name as string) ?? data.user.email?.split("@")[0] ?? "there";
  const xp = data.progress?.xp ?? 0;
  const streak = data.progress?.streak_days ?? 0;
  const words = data.progress?.words_learned ?? 0;
  const lessons = data.progress?.lessons_completed ?? 0;

  // Build a 7-day XP chart from recent completions
  const chartData = buildChart(data.recent);
  const dailyGoal = data.onboarding?.daily_minutes ?? 15;

  // Recommended next lesson (first uncompleted topic in the user's current level)
  const completedIds = new Set(data.recent.map((r) => r.lesson_id));
  const currentLevelKey = mapLevel(data.onboarding?.level ?? "beginner");
  const levelObj = course.levels.find((l) => l.id === currentLevelKey) ?? course.levels[0];
  const nextTopic = levelObj.topics.find((t) => !completedIds.has(t.id)) ?? levelObj.topics[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {greeting()}
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Bonjour, {displayName} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Currently learning <span className={`font-semibold ${accent.ink}`}>{course.flag} {course.nativeName}</span> · {levelObj.label}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-german-soft px-4 py-2 shadow-sm">
            <Flame className="size-5 text-japanese" />
            <span className="font-display text-2xl font-bold">{streak}</span>
            <span className="text-sm font-medium text-muted-foreground">day streak</span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} label="Total XP" value={xp.toLocaleString()} accent="brand" />
        <StatCard icon={BookOpen} label="Lessons done" value={lessons.toString()} accent="french" />
        <StatCard icon={Trophy} label="Words learned" value={words.toString()} accent="german" />
        <StatCard icon={Target} label="Daily goal" value={`${dailyGoal} min`} accent="japanese" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="lg:col-span-2">
          <div className={`glass-panel relative overflow-hidden rounded-3xl p-8 shadow-xl ring-1 ${accent.ring}`}>
            <div className={`absolute -right-16 -top-16 size-52 rounded-full ${accent.chip} opacity-40`} />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Next up · {levelObj.label}</div>
              <h2 className="mt-2 font-display text-3xl font-bold">{nextTopic.title}</h2>
              <p className="mt-2 max-w-lg text-muted-foreground">{nextTopic.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Target className="size-4" /> {nextTopic.minutes} min</span>
                <span className="inline-flex items-center gap-1"><Zap className="size-4" /> {nextTopic.xp} XP</span>
              </div>
              <Button asChild className="mt-6 gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90">
                <Link to="/learn/$lessonId" params={{ lessonId: nextTopic.id }}>
                  Start lesson <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* AI tutor card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="glass-panel flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-brand to-french p-8 text-white shadow-xl">
            <div>
              <Sparkles className="size-8" />
              <h3 className="mt-4 font-display text-2xl font-bold">Ask your AI tutor</h3>
              <p className="mt-2 text-sm text-white/80">
                Stuck on a grammar rule? Curious about a phrase? Get instant, personal answers.
              </p>
            </div>
            <Button asChild variant="secondary" className="mt-6 gap-2 rounded-full bg-white text-brand hover:bg-white/90">
              <Link to="/tutor">Open chat <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* XP chart + language switcher */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-3xl p-6 shadow-lg lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">XP over the last 7 days</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="xpG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="xp" stroke="var(--color-brand)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "var(--color-background)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-bold">Your languages</h3>
          <p className="text-sm text-muted-foreground">Switch or add another anytime.</p>
          <ul className="mt-4 space-y-2">
            {LANGUAGE_LIST.map((l) => {
              const active = l.id === language;
              const a = LANG_ACCENT[l.id];
              return (
                <Link
                  key={l.id}
                  to="/learn"
                  search={{ language: l.id }}
                  className={`flex items-center justify-between rounded-2xl border p-3 transition-colors ${active ? "border-brand bg-brand-soft" : "border-border hover:bg-accent"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-9 place-items-center rounded-lg ${a.chip} text-lg`}>{l.flag}</div>
                    <div>
                      <div className="text-sm font-semibold">{l.nativeName}</div>
                      <div className="text-xs text-muted-foreground">{l.name}</div>
                    </div>
                  </div>
                  {active && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-brand-foreground">Active</span>}
                </Link>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Zap; label: string; value: string; accent: "brand" | "french" | "german" | "japanese" }) {
  const cls: Record<string, string> = {
    brand: "bg-brand-soft text-brand",
    french: "bg-french-soft text-french",
    german: "bg-german-soft text-german-ink",
    japanese: "bg-japanese-soft text-japanese",
  };
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm">
      <div className={`grid size-10 place-items-center rounded-xl ${cls[accent]}`}>
        <Icon className="size-5" />
      </div>
      <div className="mt-4 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function mapLevel(level: string): "a1" | "a2" | "b1" | "b2" | "c1" | "c2" {
  if (level === "advanced") return "c1";
  if (level === "intermediate") return "b1";
  return "a1";
}

interface LessonRow { completed_at: string; xp_earned: number }
function buildChart(rows: LessonRow[]) {
  const days: { day: string; xp: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const xp = rows
      .filter((r) => r.completed_at.slice(0, 10) === key)
      .reduce((s, r) => s + (r.xp_earned || 0), 0);
    days.push({ day: d.toLocaleDateString("en", { weekday: "short" }), xp });
  }
  return days;
}
