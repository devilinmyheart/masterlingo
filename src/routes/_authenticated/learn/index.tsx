import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { CURRICULUM, LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { Check, Lock, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  language: z.enum(["french", "german", "japanese"]).optional(),
});

export const Route = createFileRoute("/_authenticated/learn/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Learn — LingoMaster" }] }),
  loaderDeps: ({ search }) => ({ language: search.language }),
  loader: ({ context }) => context.queryClient.ensureQueryData(completionsQuery),
  component: Learn,
});

const completionsQuery = queryOptions({
  queryKey: ["completions"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { completedIds: new Set<string>(), defaultLang: "french" as LanguageId };
    const [onb, comp] = await Promise.all([
      supabase.from("user_onboarding").select("language").eq("user_id", user.id).maybeSingle(),
      supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id),
    ]);
    return {
      defaultLang: (onb.data?.language ?? "french") as LanguageId,
      completedIds: new Set(comp.data?.map((c) => c.lesson_id) ?? []),
    };
  },
});

const LANG_ACCENT: Record<LanguageId, { chip: string; bar: string; ink: string; solid: string }> = {
  french: { chip: "bg-french-soft", bar: "bg-french", ink: "text-french", solid: "bg-french text-white" },
  german: { chip: "bg-german-soft", bar: "bg-german", ink: "text-german-ink", solid: "bg-german text-german-ink" },
  japanese: { chip: "bg-japanese-soft", bar: "bg-japanese", ink: "text-japanese", solid: "bg-japanese text-white" },
};

function Learn() {
  const search = Route.useSearch();
  const { data } = useQuery(completionsQuery);
  const language: LanguageId = search.language ?? data?.defaultLang ?? "french";
  const course = CURRICULUM[language];
  const accent = LANG_ACCENT[language];
  const completed = data?.completedIds ?? new Set<string>();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      {/* Language tabs */}
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_LIST.map((l) => {
          const active = l.id === language;
          const a = LANG_ACCENT[l.id];
          return (
            <Link
              key={l.id}
              to="/learn"
              search={{ language: l.id }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                active ? `${a.solid} border-transparent shadow-lg` : "border-border bg-background/60 text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="text-lg">{l.flag}</span> {l.nativeName}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          <span className={accent.ink}>{course.nativeName}</span> journey
        </h1>
        <p className="mt-2 text-muted-foreground">From A1 foundations to C2 mastery — pick a lesson to jump in.</p>
      </div>

      <div className="mt-10 space-y-10">
        {course.levels.map((level, idx) => {
          const done = level.topics.filter((t) => completed.has(t.id)).length;
          const total = level.topics.length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const unlocked = idx === 0 || completedRatio(course.levels[idx - 1], completed) >= 0.6;

          return (
            <section key={level.id} className={cn("relative", !unlocked && "opacity-60")}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-widest", accent.chip, accent.ink)}>
                      {level.label}
                    </span>
                    {!unlocked && <Lock className="size-4 text-muted-foreground" />}
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold">{level.headline}</h2>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress</div>
                  <div className="font-display text-2xl font-bold">{done}/{total}</div>
                  <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full transition-all", accent.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {level.topics.map((t) => {
                  const isDone = completed.has(t.id);
                  return (
                    <Link
                      key={t.id}
                      to="/learn/$lessonId"
                      params={{ lessonId: t.id }}
                      disabled={!unlocked}
                      className={cn(
                        "group relative flex flex-col rounded-2xl border bg-card p-5 transition-all",
                        unlocked ? "border-border hover:-translate-y-1 hover:shadow-lg" : "pointer-events-none border-border/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn("grid size-9 place-items-center rounded-lg text-sm font-bold", isDone ? accent.solid : accent.chip)}>
                          {isDone ? <Check className="size-4" /> : level.label[0]}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Clock className="size-3" /> {t.minutes}m</div>
                          <div className="flex items-center gap-1"><Zap className="size-3" /> {t.xp} XP</div>
                        </div>
                      </div>
                      <div className="mt-4 font-semibold">{t.title}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function completedRatio(level: { topics: { id: string }[] }, completed: Set<string>) {
  if (!level.topics.length) return 1;
  return level.topics.filter((t) => completed.has(t.id)).length / level.topics.length;
}
