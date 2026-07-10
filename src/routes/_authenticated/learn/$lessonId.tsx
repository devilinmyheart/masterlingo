import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CURRICULUM, findTopic } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { STARTER_VOCAB } from "@/data/vocabulary";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, Sparkles, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/learn/$lessonId")({
  head: ({ params }) => ({
    meta: [{ title: `${(findTopic(params.lessonId)?.topic.title ?? "Lesson")} — LingoMaster` }],
  }),
  component: LessonPage,
});

type Card = { front: string; back: string; pronunciation?: string; options: string[] };

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();

  const found = findTopic(lessonId);
  if (!found) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <h1 className="font-display text-3xl font-bold">Lesson not found</h1>
        <Button asChild className="mt-6"><Link to="/learn">Back to library</Link></Button>
      </div>
    );
  }
  const { language, level, topic } = found;

  // Build 5-card deck from starter vocab (deterministic slice per lesson).
  const cards = useMemo<Card[]>(() => buildDeck(language.id, lessonId), [language.id, lessonId]);

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const total = cards.length;
  const current = cards[idx];
  const progress = ((idx + (chosen ? 1 : 0)) / total) * 100;
  const isCorrect = chosen === current?.back;

  function chooseAnswer(option: string) {
    if (chosen) return;
    setChosen(option);
    setShowBack(true);
    if (option === current.back) setCorrect((n) => n + 1);
  }
  function nextCard() {
    setChosen(null);
    setShowBack(false);
    if (idx + 1 >= total) setDone(true);
    else setIdx((n) => n + 1);
  }

  async function completeLesson() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const score = Math.round((correct / total) * 100);
      const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      const xp = Math.round(topic.xp * (0.6 + 0.4 * (correct / total)));

      await supabase.from("lesson_completions").upsert({
        user_id: user.id,
        lesson_id: topic.id,
        language: language.id,
        level: level.id,
        score,
        minutes_spent: minutes,
        xp_earned: xp,
      });

      // Update progress totals
      const { data: prog } = await supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle();
      const today = new Date().toISOString().slice(0, 10);
      const last = prog?.last_active_date;
      const isSameDay = last === today;
      const isYesterday = last === new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const streak = isSameDay ? (prog?.streak_days ?? 1) : isYesterday ? (prog?.streak_days ?? 0) + 1 : 1;

      await supabase.from("user_progress").upsert({
        user_id: user.id,
        xp: (prog?.xp ?? 0) + xp,
        lessons_completed: (prog?.lessons_completed ?? 0) + 1,
        minutes_studied: (prog?.minutes_studied ?? 0) + minutes,
        words_learned: (prog?.words_learned ?? 0) + total,
        streak_days: streak,
        longest_streak: Math.max(prog?.longest_streak ?? 0, streak),
        last_active_date: today,
      });

      toast.success(`Lesson complete! +${xp} XP`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setSaving(false);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language.id === "french" ? "fr-FR" : language.id === "german" ? "de-DE" : "ja-JP";
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/learn" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{language.flag} {language.nativeName} · {level.label}</span>
          <button onClick={() => navigate({ to: "/learn" })} aria-label="Exit lesson" className="rounded-full p-1.5 hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-bold md:text-3xl">{topic.title}</h1>
          <span className="text-sm font-semibold text-muted-foreground">{correct} / {total} correct</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-panel mt-8 rounded-3xl p-8 shadow-xl md:p-12"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Translate to English</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="font-display text-4xl font-bold md:text-5xl">{current.front}</div>
              <button onClick={() => speak(current.front)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                <Volume2 className="size-5" />
              </button>
            </div>
            {current.pronunciation && (
              <div className="mt-1 font-mono text-sm text-muted-foreground">{current.pronunciation}</div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.options.map((opt) => {
                const isChoice = chosen === opt;
                const isRight = opt === current.back;
                return (
                  <button
                    key={opt}
                    onClick={() => chooseAnswer(opt)}
                    disabled={!!chosen}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left text-base font-medium transition-all",
                      !chosen && "border-border bg-background/60 hover:border-brand hover:bg-brand-soft",
                      chosen && isRight && "border-green-500 bg-green-500/10 text-green-700",
                      chosen && isChoice && !isRight && "border-destructive bg-destructive/10 text-destructive"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showBack && (
              <div className={cn("mt-6 rounded-2xl border p-4", isCorrect ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5")}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {isCorrect ? <><Check className="size-4 text-green-600" /> Correct!</> : <><X className="size-4 text-destructive" /> Not quite — it's <span className="ml-1 font-bold">{current.back}</span></>}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button onClick={nextCard} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                    {idx + 1 === total ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel mt-8 rounded-3xl p-10 text-center shadow-xl"
          >
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-tr from-brand to-french text-white shadow-2xl">
              <Sparkles className="size-9" />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">Lesson complete!</h2>
            <p className="mt-2 text-muted-foreground">You got {correct} of {total} correct.</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Stat label="Accuracy" value={`${Math.round((correct / total) * 100)}%`} />
              <Stat label="XP earned" value={`+${Math.round(topic.xp * (0.6 + 0.4 * (correct / total)))}`} />
              <Stat label="Words seen" value={total.toString()} />
            </div>
            <Button onClick={completeLesson} disabled={saving} className="mt-8 rounded-full bg-brand px-8 py-6 text-brand-foreground hover:bg-brand/90">
              {saving ? "Saving…" : "Save & continue"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function buildDeck(language: LanguageId, seed: string): Card[] {
  const pool = STARTER_VOCAB[language];
  // deterministic offset so different lessons show different words
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const start = h % Math.max(1, pool.length);
  const picked = Array.from({ length: 5 }, (_, i) => pool[(start + i) % pool.length]);
  return picked.map((w) => {
    const wrongs = pool.filter((x) => x.translation !== w.translation);
    const distractors = shuffle(wrongs, h + w.word.length).slice(0, 3).map((x) => x.translation);
    const options = shuffle([w.translation, ...distractors], h);
    return { front: w.word, back: w.translation, pronunciation: w.pronunciation, options };
  });
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
