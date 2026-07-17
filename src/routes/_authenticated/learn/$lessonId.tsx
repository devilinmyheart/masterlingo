import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CURRICULUM, findTopic } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { STARTER_VOCAB, FOUNDATIONS, FOUNDATION_CARDS, type FoundationKind, type Word } from "@/data/vocabulary";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, PartyPopper, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { speakWithSlot, useVoicePrefs } from "@/lib/voice-prefs";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { getAnimationFor, type IconSpec } from "@/data/animations";
import { TranslateExercise } from "@/components/TranslateExercise";

export const Route = createFileRoute("/_authenticated/learn/$lessonId")({
  head: ({ params }) => {
    const topic = findTopic(params.lessonId)?.topic;
    const title = topic?.title ?? "Lesson";
    return {
      meta: [
        { title: `${title} — Master Lingo` },
        { name: "description", content: topic?.description ?? `Practice the "${title}" lesson on Master Lingo with adaptive flashcards and audio.` },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: `https://masterlingo.lovable.app/learn/${params.lessonId}` }],
    };
  },
  component: LessonPage,
});

type Card = {
  front: string;
  back: string;
  pronunciation?: string;
  options: string[];
  icon: IconSpec | null;
  optionIcons: (IconSpec | null)[];
  example?: string;
  exampleTranslation?: string;
  isFoundation?: boolean;
  exampleWord?: string;
};

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

  const isReview = /-review$/.test(lessonId);
  const cards = useMemo<Card[]>(() => buildDeck(language.id, lessonId, isReview), [language.id, lessonId, isReview]);

  const [idx, setIdx] = useState(0);
  // Review lessons skip straight to quiz. Every other lesson teaches the whole module first, then quizzes at the end.
  const [phase, setPhase] = useState<"learn" | "quiz" | "translate">(isReview ? "quiz" : "learn");
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const foundation = detectFoundation(lessonId);
  const total = cards.length;
  const current = cards[idx];
  const hasTranslate =
    !isReview &&
    !foundation &&
    !!current?.example &&
    !!current?.exampleTranslation &&
    current.exampleTranslation.trim().split(/\s+/).length >= 2;

  const isSymbolFoundation = foundation === "alphabet" || foundation === "numbers";
  const learningUnits = isReview ? 0 : isSymbolFoundation ? 1 : total;
  const completedLearnUnits =
    !isReview && phase !== "learn" ? learningUnits :
    phase === "learn" ? (isSymbolFoundation ? 0 : idx) : 0;
  const completedQuizUnits =
    done ? total :
    phase === "quiz" ? idx + (chosen ? 0.5 : 0) :
    phase === "translate" ? idx + 0.75 :
    0;
  const progress = ((completedLearnUnits + completedQuizUnits) / (learningUnits + total)) * 100;
  const isCorrect = chosen === current?.back;

  function chooseAnswer(option: string) {
    if (chosen) return;
    setChosen(option);
    setShowBack(true);
    if (option === current.back) setCorrect((n) => n + 1);
  }
  function afterQuiz() {
    if (hasTranslate) {
      setChosen(null);
      setShowBack(false);
      setPhase("translate");
      return;
    }
    advance();
  }
  function nextLearningCard() {
    setChosen(null);
    setShowBack(false);
    if (idx + 1 >= total) {
      setIdx(0);
      setPhase("quiz");
      return;
    }
    setIdx((n) => n + 1);
  }
  function advance() {
    setChosen(null);
    setShowBack(false);
    setPhase("quiz");
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

  const [voicePrefs] = useVoicePrefs();

  function speak(text: string) {
    if (language.id === "english") return speakWithSlot(text, voicePrefs.english);
    if (language.id === "hindi_english") return speakWithSlot(text, voicePrefs.hindi_english.target);
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang =
      language.id === "french" ? "fr-FR" :
      language.id === "german" ? "de-DE" :
      "ja-JP";
    window.speechSynthesis.speak(u);
  }

  function speakGloss(text: string) {
    if (language.id === "hindi_english") return speakWithSlot(text, voicePrefs.hindi_english.gloss);
  }

  const isLast = idx + 1 === total;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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
          <span className="text-sm font-semibold text-muted-foreground">
            {phase === "learn" ? `${idx + 1} / ${total}` : `${correct} / ${total} correct`}
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        {isReview && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-brand">
            {level.label} checkpoint — quiz mode
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={`${idx}-${phase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-panel mt-8 rounded-3xl p-8 shadow-xl md:p-12"
          >
            {phase === "learn" && isSymbolFoundation && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest text-brand">
                  {foundation === "numbers" ? "Numbers" : "Alphabet"} · {total} to learn
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Tap any tile to hear it</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Take your time — listen, repeat aloud, and drill any letter in any order. When you feel ready, start the quiz.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {cards.map((c) => (
                    <button
                      key={c.front}
                      onClick={() => speak(c.pronunciation || c.front)}
                      className="group flex flex-col items-center gap-1 rounded-2xl border-2 border-border bg-background/60 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft"
                    >
                      <div className="font-display text-3xl font-bold md:text-4xl">{c.front}</div>
                      <div className="text-xs font-semibold text-muted-foreground">"{c.back}"</div>
                      {c.exampleWord && (
                        <div className="text-[10px] text-muted-foreground/80">as in {c.exampleWord}</div>
                      )}
                      <Volume2 className="mt-1 size-3.5 text-muted-foreground group-hover:text-brand" />
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => { setIdx(0); setPhase("quiz"); }}
                    className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90"
                  >
                    Start quiz
                  </Button>
                </div>
              </>
            )}
            {phase === "learn" && !isSymbolFoundation && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest text-brand">
                  {current.isFoundation
                    ? (foundation === "numbers" ? "New number" : "New letter")
                    : "New word"} · {idx + 1} of {total}
                </div>
                <div className="mt-4 flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={cn("font-display font-bold", current.isFoundation ? "text-7xl md:text-8xl" : "text-4xl md:text-5xl")}>{current.front}</div>
                      <button onClick={() => speak(current.pronunciation || current.front)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Volume2 className="size-5" />
                      </button>
                    </div>
                    {!current.isFoundation && current.pronunciation && (
                      <div className="mt-1 font-mono text-sm text-muted-foreground">/{current.pronunciation}/</div>
                    )}
                  </div>
                  {current.icon && (
                    <div className="grid size-32 shrink-0 place-items-center rounded-3xl bg-brand-soft sm:size-40">
                      <AnimatedIcon icon={current.icon} size={96} label={current.back} />
                    </div>
                  )}
                </div>
                {current.isFoundation ? (
                  <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Say it</div>
                    <div className="mt-1 font-display text-3xl font-bold md:text-4xl">"{current.back}"</div>
                    {current.exampleWord && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        As in <span className="font-semibold text-foreground">{current.exampleWord}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {language.id === "hindi_english" ? "अर्थ (Hindi)" : "Meaning in English"}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="font-display text-2xl font-bold md:text-3xl">{current.back}</div>
                      {language.id === "hindi_english" && (
                        <button
                          onClick={() => speakGloss(current.back)}
                          aria-label="Play Hindi translation"
                          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Volume2 className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <p className="mt-6 text-sm text-muted-foreground">
                  {current.isFoundation
                    ? "Tap the speaker to hear it. Repeat it out loud, then continue."
                    : "Listen, repeat, and continue when ready."}
                </p>
                <div className="mt-6 flex justify-end">
                  <Button onClick={nextLearningCard} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90">
                    Next
                  </Button>
                </div>
              </>
            )}
            {phase === "quiz" && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {current.isFoundation ? "How do you say this?" : "What does this mean?"}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className={cn("font-display font-bold", current.isFoundation ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl")}>{current.front}</div>
                  <button onClick={() => speak(current.pronunciation || current.front)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Volume2 className="size-5" />
                  </button>
                </div>
                {!current.isFoundation && current.pronunciation && (
                  <div className="mt-1 font-mono text-sm text-muted-foreground">/{current.pronunciation}/</div>
                )}



                {current.optionIcons.every(Boolean) ? (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {current.options.map((opt, i) => {
                      const isChoice = chosen === opt;
                      const isRight = opt === current.back;
                      const icon = current.optionIcons[i]!;
                      return (
                        <button
                          key={opt}
                          onClick={() => chooseAnswer(opt)}
                          disabled={!!chosen}
                          className={cn(
                            "group flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                            !chosen && "border-border bg-background/60 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft",
                            chosen && isRight && "border-green-500 bg-green-500/10 text-green-700",
                            chosen && isChoice && !isRight && "border-destructive bg-destructive/10 text-destructive",
                            chosen && !isChoice && !isRight && "opacity-50"
                          )}
                        >
                          <div className="grid size-20 place-items-center rounded-xl bg-brand-soft/60 sm:size-24">
                            <AnimatedIcon icon={icon} size={56} label={opt} />
                          </div>
                          <span className="text-sm font-semibold">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
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
                )}

                {showBack && (
                  <div className={cn("mt-6 rounded-2xl border p-4", isCorrect ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5")}>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {isCorrect ? <><Check className="size-4 text-green-600" /> Correct!</> : <><X className="size-4 text-destructive" /> Not quite — it's <span className="ml-1 font-bold">{current.back}</span></>}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button onClick={afterQuiz} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90">
                        {hasTranslate ? "Continue" : (isLast ? "Finish lesson" : "Next word")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {phase === "translate" && current.example && current.exampleTranslation && (
              <TranslateExercise
                phrase={current.example}
                phraseTranslation={current.exampleTranslation}
                promptLabel={
                  language.id === "hindi_english"
                    ? "इसे हिंदी में लिखें"
                    : `Write this in ${language.id === "english" ? "plain English" : "English"}`
                }
                onSpeak={() => speak(current.example!)}
                distractorPool={cards
                  .filter((c, i) => i !== idx && c.exampleTranslation)
                  .map((c) => c.exampleTranslation!)}
                onResult={(ok) => {
                  if (ok) setCorrect((n) => n + 0); // XP already awarded on quiz; keep parity simple
                  advance();
                }}
                isLast={isLast}
              />
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
            <motion.div
              initial={{ scale: 0.4, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="relative mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-tr from-brand to-french text-white shadow-2xl"
            >
              <PartyPopper className="size-10" />
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -top-2 -right-2 text-3xl"
                animate={{ rotate: [0, 20, -10, 20, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                🎉
              </motion.span>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -bottom-2 -left-2 text-3xl"
                animate={{ rotate: [0, -20, 10, -20, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                🎊
              </motion.span>
            </motion.div>
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

function detectFoundation(lessonId: string): FoundationKind | null {
  if (/alphabet|pron|hiragana|katakana/i.test(lessonId)) return "alphabet";
  if (/number/i.test(lessonId)) return "numbers";
  if (/greeting/i.test(lessonId)) return "greetings";
  return null;
}

function buildDeck(language: LanguageId, seed: string, isReview: boolean): Card[] {
  const foundation = isReview ? null : detectFoundation(seed);
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);

  // Alphabet / numbers get a dedicated pronunciation-first deck (no "English meaning").
  if (foundation === "alphabet" || foundation === "numbers") {
    const deck = FOUNDATION_CARDS[language]?.[foundation] ?? [];
    if (deck.length > 0) {
      const picked = foundation === "alphabet" ? deck : deck.slice(0, Math.min(10, deck.length));
      return picked.map((c) => {
        const wrongs = deck.filter((x) => x.name !== c.name);
        const distractors = shuffle(wrongs, h + c.symbol.length).slice(0, 3).map((x) => x.name);
        const options = shuffle([c.name, ...distractors], h);
        return {
          front: c.symbol,
          back: c.name,
          pronunciation: c.sound,
          options,
          icon: null,
          optionIcons: options.map(() => null),
          isFoundation: true,
          exampleWord: c.exampleWord,
        };
      });
    }
  }

  // Greetings and regular vocabulary use translation-style cards.
  const pool: Word[] = foundation
    ? FOUNDATIONS[language][foundation]
    : STARTER_VOCAB[language];
  const size = isReview ? Math.min(8, pool.length) : Math.min(5, pool.length);
  const start = h % Math.max(1, pool.length);
  const picked = Array.from({ length: size }, (_, i) => pool[(start + i) % pool.length]);
  const distractorPool = STARTER_VOCAB[language].concat(pool);
  return picked.map((w) => {
    const wrongs = distractorPool.filter((x) => x.translation !== w.translation);
    const distractors = shuffle(wrongs, h + w.word.length).slice(0, 3).map((x) => x.translation);
    const options = shuffle([w.translation, ...distractors], h);
    return {
      front: w.word,
      back: w.translation,
      pronunciation: w.pronunciation,
      options,
      icon: getAnimationFor(w.translation),
      optionIcons: options.map((o) => getAnimationFor(o)),
      example: w.example,
      exampleTranslation: w.exampleTranslation,
    };
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

// Silence unused import warning for CURRICULUM (kept for potential future use)
void CURRICULUM;
