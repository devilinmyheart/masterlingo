import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import { CURRICULUM, LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId, Level, Topic } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { Check, Lock, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { categoryIconFor } from "@/data/animations";
import { useLanguageGate } from "@/hooks/useLanguageGate";

const searchSchema = z.object({
  language: z.enum(["french", "german", "japanese", "english", "hindi_english"]).optional(),
});

export const Route = createFileRoute("/_authenticated/learn/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Learn — Master Lingo" },
      { name: "description", content: "Structured CEFR A1–C2 learning paths for French, German, and Japanese with adaptive lessons and native audio." },
      { property: "og:title", content: "Learn — Master Lingo" },
      { property: "og:description", content: "Structured CEFR A1–C2 learning paths for French, German, and Japanese." },
      { property: "og:url", content: "https://masterlingo.lovable.app/learn" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/learn" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": LANGUAGE_LIST.map((lang) => ({
            "@type": "Course",
            name: `${lang.name} — CEFR A1 to C2`,
            description: `Learn ${lang.name} from beginner (A1) to advanced (C2) with AI-guided lessons on Master Lingo.`,
            provider: {
              "@type": "Organization",
              name: "Master Lingo",
              sameAs: "https://masterlingo.lovable.app/",
            },
            inLanguage: { french: "fr", german: "de", japanese: "ja", english: "en", hindi_english: "en" }[lang.id],
            educationalLevel: "A1, A2, B1, B2, C1, C2",
          })),
        }),
      },
    ],
  }),
  loaderDeps: ({ search }) => ({ language: search.language }),
  loader: ({ context }) => context.queryClient.ensureQueryData(learnQuery),
  component: Learn,
});

const learnQuery = queryOptions({
  queryKey: ["learn-path"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        defaultLang: "french" as LanguageId,
        completedIds: new Set<string>(),
        xp: 0,
        streak: 0,
        hearts: 5,
      };
    }
    const [onb, comp, prog] = await Promise.all([
      supabase.from("user_onboarding").select("language").eq("user_id", user.id).maybeSingle(),
      supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id),
      supabase.from("user_progress").select("xp,streak_days").eq("user_id", user.id).maybeSingle(),
    ]);
    return {
      defaultLang: (onb.data?.language ?? "french") as LanguageId,
      completedIds: new Set(comp.data?.map((c) => c.lesson_id) ?? []),
      xp: prog.data?.xp ?? 0,
      streak: prog.data?.streak_days ?? 0,
      hearts: 5,
    };
  },
});

type Accent = {
  ring: string; // border/ring color for nodes
  solidBg: string;
  solidText: string;
  chip: string;
  ink: string;
  shadow: string; // duolingo-style bottom shadow color
  softBg: string;
};

const LANG_ACCENT: Record<LanguageId, Accent> = {
  french: {
    ring: "border-french",
    solidBg: "bg-french",
    solidText: "text-white",
    chip: "bg-french-soft",
    ink: "text-french",
    shadow: "shadow-[0_6px_0_0_hsl(var(--french-shadow,220_70%_35%))]",
    softBg: "bg-french-soft",
  },
  german: {
    ring: "border-german",
    solidBg: "bg-german",
    solidText: "text-german-ink",
    chip: "bg-german-soft",
    ink: "text-german-ink",
    shadow: "shadow-[0_6px_0_0_rgba(140,100,10,0.6)]",
    softBg: "bg-german-soft",
  },
  japanese: {
    ring: "border-japanese",
    solidBg: "bg-japanese",
    solidText: "text-white",
    chip: "bg-japanese-soft",
    ink: "text-japanese",
    shadow: "shadow-[0_6px_0_0_rgba(160,20,40,0.55)]",
    softBg: "bg-japanese-soft",
  },
  english: {
    ring: "border-english",
    solidBg: "bg-english",
    solidText: "text-white",
    chip: "bg-english-soft",
    ink: "text-english",
    shadow: "shadow-[0_6px_0_0_rgba(20,110,120,0.55)]",
    softBg: "bg-english-soft",
  },
  hindi_english: {
    ring: "border-hindi",
    solidBg: "bg-hindi",
    solidText: "text-hindi-ink",
    chip: "bg-hindi-soft",
    ink: "text-hindi-ink",
    shadow: "shadow-[0_6px_0_0_rgba(170,110,10,0.55)]",
    softBg: "bg-hindi-soft",
  },
};

// Path nodes now render category-aware animated emoji derived from topic id.

// Horizontal offsets for the winding path (percent of container width)
const PATH_OFFSETS = [0, 18, 28, 18, 0, -18, -28, -18];

function Learn() {
  const search = Route.useSearch();
  const { data } = useQuery(learnQuery);
  const language: LanguageId = search.language ?? data?.defaultLang ?? "french";
  const course = CURRICULUM[language];
  const accent = LANG_ACCENT[language];
  const completed = data?.completedIds ?? new Set<string>();

  // Flatten curriculum to a single path so unlock logic is linear
  const flat: { level: Level; topic: Topic; levelIdx: number; topicIdx: number }[] = [];
  course.levels.forEach((level, levelIdx) => {
    level.topics.forEach((topic, topicIdx) => flat.push({ level, topic, levelIdx, topicIdx }));
  });

  // A lesson is unlocked if it's the first one, or the previous one is completed
  const isUnlocked = (globalIdx: number) => {
    if (globalIdx === 0) return true;
    const prev = flat[globalIdx - 1];
    return completed.has(prev.topic.id);
  };
  const activeIdx = flat.findIndex((f) => !completed.has(f.topic.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* HUD */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <LanguageSwitcher activeLang={language} />

          <div className="flex items-center gap-2 text-sm font-bold sm:gap-4">
            <HudStat icon={<Flame className="size-4 text-orange-500" />} value={data?.streak ?? 0} label="streak" />
            <HudStat icon={<Zap className="size-4 text-yellow-500" />} value={data?.xp ?? 0} label="XP" />
            <HudStat
              icon={<span className="text-base leading-none">❤️</span>}
              value={data?.hearts ?? 5}
              label="hearts"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6">
        {course.levels.map((level, levelIdx) => {
          const done = level.topics.filter((t) => completed.has(t.id)).length;
          const total = level.topics.length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const levelStart = flat.findIndex((f) => f.level.id === level.id);
          const levelUnlocked = isUnlocked(levelStart);

          return (
            <section key={level.id} className="mb-10">
              {/* Chapter banner */}
              <div
                className={cn(
                  "sticky top-[62px] z-10 mb-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-b-4 p-4 sm:p-5",
                  accent.solidBg,
                  accent.solidText,
                  !levelUnlocked && "opacity-70"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-90">
                    {!levelUnlocked && <Lock className="size-3.5" />}
                    Section {levelIdx + 1} · {level.label}
                  </div>
                  <h2 className="mt-1 truncate font-display text-lg font-black sm:text-xl">{level.headline}</h2>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-2xl font-black">{done}/{total}</div>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-background/30">
                    <div className="h-full bg-background/90" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Winding path of lesson nodes */}
              <div className="relative flex flex-col items-center gap-6 py-2">
                {level.topics.map((topic, topicIdx) => {
                  const globalIdx = levelStart + topicIdx;
                  const isDone = completed.has(topic.id);
                  const unlocked = isUnlocked(globalIdx);
                  const isActive = globalIdx === activeIdx;
                  const offset = PATH_OFFSETS[globalIdx % PATH_OFFSETS.length];

                  return (
                    <PathNode
                      key={topic.id}
                      topic={topic}
                      offset={offset}
                      accent={accent}
                      isDone={isDone}
                      unlocked={unlocked}
                      isActive={isActive}
                    />
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

function HudStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${value} ${label}`}>
      {icon}
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function PathNode({
  topic,
  offset,
  accent,
  isDone,
  unlocked,
  isActive,
}: {
  topic: Topic;
  offset: number;
  accent: Accent;
  isDone: boolean;
  unlocked: boolean;
  isActive: boolean;
}) {
  const categoryIcon = categoryIconFor(topic.id);
  const content = (
    <motion.div
      whileHover={unlocked ? { y: -3 } : undefined}
      whileTap={unlocked ? { y: 2, transition: { duration: 0.05 } } : undefined}
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}%)` }}
    >
      {isActive && unlocked && (
        <div className="absolute -top-9 z-10 rounded-xl border-2 border-b-4 border-foreground bg-background px-3 py-1 text-xs font-black uppercase tracking-widest text-foreground">
          Start
          <div className="absolute inset-x-0 -bottom-1.5 mx-auto size-3 rotate-45 border-b-2 border-r-2 border-foreground bg-background" />
        </div>
      )}
      <div
        className={cn(
          "grid size-20 place-items-center rounded-full border-4 transition-transform sm:size-24",
          isDone
            ? cn(accent.solidBg, accent.solidText, "border-white/30", accent.shadow)
            : unlocked
            ? cn(accent.solidBg, accent.solidText, "border-white/40", accent.shadow)
            : "border-border bg-muted text-muted-foreground shadow-[0_5px_0_0_hsl(var(--border))]"
        )}
      >
        {isDone ? (
          <Check className="size-9 sm:size-10" strokeWidth={3} />
        ) : unlocked ? (
          <AnimatedIcon icon={categoryIcon} size={44} label={topic.title} />
        ) : (
          <Lock className="size-7 sm:size-8" />
        )}
      </div>
      <div className="mt-3 max-w-[220px] text-center">
        <div className={cn("text-sm font-bold leading-tight sm:text-base", !unlocked && "text-muted-foreground")}>
          {topic.title}
        </div>
        <div className="mt-0.5 text-xs font-semibold text-muted-foreground">
          +{topic.xp} XP · {topic.minutes} min
        </div>
      </div>
    </motion.div>
  );

  if (!unlocked) {
    return <div className="cursor-not-allowed opacity-60">{content}</div>;
  }

  return (
    <Link
      to="/learn/$lessonId"
      params={{ lessonId: topic.id }}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 rounded-full"
      aria-label={`Start lesson: ${topic.title}`}
    >
      {content}
    </Link>
  );
}

function LanguageSwitcher({ activeLang }: { activeLang: LanguageId }) {
  const { gate, isAllowed } = useLanguageGate();
  return (
    <div className="flex flex-wrap gap-1.5">
      {LANGUAGE_LIST.map((l) => {
        const active = l.id === activeLang;
        const a = LANG_ACCENT[l.id];
        const locked = !isAllowed(l.id);
        return (
          <Link
            key={l.id}
            to="/learn"
            search={{ language: l.id }}
            onClick={(e) => {
              if (!gate(l.id)) e.preventDefault();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all",
              active
                ? cn(a.solidBg, a.solidText, "border-transparent scale-105")
                : "border-border bg-background text-muted-foreground hover:border-foreground/30",
              locked && !active && "opacity-60"
            )}
          >
            <span className="text-base">{l.flag}</span>
            <span className="hidden sm:inline">{l.nativeName}</span>
            {locked && !active && <Lock className="size-3" />}
          </Link>
        );
      })}
    </div>
  );
}
