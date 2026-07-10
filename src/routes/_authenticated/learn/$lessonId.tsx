import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CURRICULUM, findTopic } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { STARTER_VOCAB } from "@/data/vocabulary";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, Mic, MicOff, Sparkles, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { speakWithSlot, useVoicePrefs } from "@/lib/voice-prefs";

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
  const [phase, setPhase] = useState<"learn" | "quiz" | "speak">("learn");
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const total = cards.length;
  const current = cards[idx];
  const phaseFrac = phase === "learn" ? 0 : phase === "quiz" ? 0.33 : 0.66;
  const answered = phase === "quiz" && chosen ? 0.17 : 0;
  const progress = ((idx + phaseFrac + answered) / total) * 100;
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
    setPhase("learn");
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
    // Hindi-for-English: speak the translation in Hindi using the gloss voice.
    if (language.id === "hindi_english") return speakWithSlot(text, voicePrefs.hindi_english.gloss);
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
            key={`${idx}-${phase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-panel mt-8 rounded-3xl p-8 shadow-xl md:p-12"
          >
            {phase === "learn" && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest text-brand">New word · {idx + 1} of {total}</div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="font-display text-4xl font-bold md:text-5xl">{current.front}</div>
                  <button onClick={() => speak(current.front)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Volume2 className="size-5" />
                  </button>
                </div>
                {current.pronunciation && (
                  <div className="mt-1 font-mono text-sm text-muted-foreground">/{current.pronunciation}/</div>
                )}
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
                <p className="mt-6 text-sm text-muted-foreground">
                  Take a moment to say it out loud. When you're ready, we'll check your recall.
                </p>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setPhase("quiz")} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90">
                    Got it — quiz me
                  </Button>
                </div>
              </>
            )}
            {phase === "quiz" && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What does this mean?</div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="font-display text-4xl font-bold md:text-5xl">{current.front}</div>
                  <button onClick={() => speak(current.front)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Volume2 className="size-5" />
                  </button>
                </div>
                {current.pronunciation && (
                  <div className="mt-1 font-mono text-sm text-muted-foreground">/{current.pronunciation}/</div>
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
                      <Button onClick={() => { setChosen(null); setShowBack(false); setPhase("speak"); }} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                        Now say it out loud
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {phase === "speak" && (
              <SpeakStep
                target={current.front}
                pronunciation={current.pronunciation}
                langCode={sttLangFor(language.id)}
                onSkip={nextCard}
                onDone={nextCard}
                onSpeak={() => speak(current.front)}
                isLast={idx + 1 === total}
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

function sttLangFor(id: LanguageId): string {
  switch (id) {
    case "french": return "fr-FR";
    case "german": return "de-DE";
    case "japanese": return "ja-JP";
    case "english": return "en-US";
    case "hindi_english": return "en-US";
    default: return "en-US";
  }
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  // Levenshtein-based similarity
  const dp: number[] = Array(y.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = dp[j];
      dp[j] = x[i - 1] === y[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  const dist = dp[y.length];
  return 1 - dist / Math.max(x.length, y.length);
}

function SpeakStep({
  target, pronunciation, langCode, onSkip, onDone, onSpeak, isLast,
}: {
  target: string;
  pronunciation?: string;
  langCode: string;
  onSkip: () => void;
  onDone: () => void;
  onSpeak: () => void;
  isLast: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  function start() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = langCode;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    setTranscript("");
    setScore(null);
    setListening(true);
    rec.onresult = (e) => {
      const alts: string[] = [];
      for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
      const best = alts.reduce((acc, t) => Math.max(acc, similarity(t, target)), 0);
      setTranscript(alts[0] ?? "");
      setScore(Math.round(best * 100));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  const passed = score !== null && score >= 60;

  return (
    <>
      <div className="text-xs font-bold uppercase tracking-widest text-brand">Say it out loud</div>
      <div className="mt-4 flex items-center gap-3">
        <div className="font-display text-4xl font-bold md:text-5xl">{target}</div>
        <button onClick={onSpeak} aria-label="Hear it" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Volume2 className="size-5" />
        </button>
      </div>
      {pronunciation && (
        <div className="mt-1 font-mono text-sm text-muted-foreground">/{pronunciation}/</div>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        {supported ? (
          <button
            onClick={start}
            disabled={listening}
            className={cn(
              "grid size-24 place-items-center rounded-full border-4 transition-all",
              listening
                ? "animate-pulse border-destructive bg-destructive/10 text-destructive"
                : "border-brand bg-brand-soft text-brand hover:scale-105"
            )}
            aria-label={listening ? "Listening" : "Tap to speak"}
          >
            {listening ? <MicOff className="size-9" /> : <Mic className="size-9" />}
          </button>
        ) : (
          <div className="rounded-2xl border border-border bg-background/60 p-4 text-center text-sm text-muted-foreground">
            Speech recognition isn't supported in this browser. Try Chrome, Edge, or Safari to practice pronunciation.
          </div>
        )}
        <div className="text-center text-sm text-muted-foreground">
          {listening ? "Listening…" : supported ? "Tap the mic and say the word" : ""}
        </div>

        {transcript && (
          <div className={cn(
            "w-full rounded-2xl border p-4 text-center",
            passed ? "border-green-500/40 bg-green-500/5" : "border-amber-500/40 bg-amber-500/5"
          )}>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">You said</div>
            <div className="mt-1 font-display text-xl font-bold">{transcript}</div>
            <div className="mt-2 text-sm font-semibold">
              {passed ? (
                <span className="text-green-600 inline-flex items-center gap-1"><Check className="size-4" /> Nice — {score}% match</span>
              ) : (
                <span className="text-amber-700">Close — {score}% match. Try again for a cleaner take.</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onSkip} className="rounded-full">
          Skip
        </Button>
        <Button onClick={onDone} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90">
          {isLast ? "Finish lesson" : "Next word"}
        </Button>
      </div>
    </>
  );
}

// Minimal typing for the browser SpeechRecognition API (not in lib.dom by default in all TS setups).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: { results: { [i: number]: { transcript: string }; length: number }[] & { [i: number]: { length: number; [j: number]: { transcript: string } } } }) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  start: () => void;
};
