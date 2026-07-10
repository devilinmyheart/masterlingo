import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { STARTER_VOCAB } from "@/data/vocabulary";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type Goal = "travel" | "work" | "exams" | "conversation" | "culture";
type Level = "beginner" | "intermediate" | "advanced";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — LingoMaster" },
      { name: "description", content: "Set your target language, level, and daily goal to build a personalized LingoMaster learning plan." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/onboarding" }],
  }),
  component: Onboarding,
});

const GOALS: { id: Goal; label: string; description: string; emoji: string }[] = [
  { id: "travel", label: "Travel", description: "Order coffee, ask directions, feel at home abroad", emoji: "✈️" },
  { id: "work", label: "Career", description: "Communicate with global teams and clients", emoji: "💼" },
  { id: "exams", label: "Certification", description: "DELF, Goethe, JLPT — study to pass", emoji: "🎓" },
  { id: "conversation", label: "Conversation", description: "Chat freely with friends and native speakers", emoji: "💬" },
  { id: "culture", label: "Culture", description: "Read literature, watch films, understand deeper", emoji: "🎬" },
];

const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: "beginner", label: "Beginner (A1–A2)", description: "New to the language or a few words" },
  { id: "intermediate", label: "Intermediate (B1–B2)", description: "Can hold a simple conversation" },
  { id: "advanced", label: "Advanced (C1–C2)", description: "Comfortable in most situations" },
];

function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<LanguageId | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [level, setLevel] = useState<Level>("beginner");
  const [minutes, setMinutes] = useState(15);
  const [saving, setSaving] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function toggleGoal(id: Goal) {
    setGoals((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= 2) {
        // Replace the oldest selection so users can freely swap up to 2.
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  async function finish() {
    if (!language || goals.length === 0) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      await supabase.from("user_onboarding").upsert({
        user_id: user.id,
        language,
        goal: goals[0],
        secondary_goal: goals[1] ?? null,
        level,
        daily_minutes: minutes,
      });
      await supabase.from("user_progress").upsert({ user_id: user.id }, { onConflict: "user_id" });

      // Seed starter vocab so the vocabulary page isn't empty on day one.
      const words = STARTER_VOCAB[language].slice(0, 12).map((w) => ({
        user_id: user.id,
        language,
        word: w.word,
        translation: w.translation,
        pronunciation: w.pronunciation,
        example: w.example,
      }));
      if (words.length) await supabase.from("vocabulary_items").insert(words);

      toast.success("You're all set! Let's start learning.");
      await qc.invalidateQueries({ queryKey: ["onboarding-status", user.id] });
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save preferences");
    } finally {
      setSaving(false);
    }
  }

  const canNext =
    (step === 0 && language) ||
    (step === 1 && goals.length > 0) ||
    step === 2 ||
    step === 3;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
      {/* Progress */}
      <div className="mb-10 flex items-center justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center">
            <div
              className={cn(
                "grid size-8 place-items-center rounded-full text-xs font-bold transition-colors",
                i <= step ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            {i < 3 && <div className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-brand" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-3xl p-8 shadow-xl md:p-10"
      >
        {step === 0 && (
          <>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Which language calls to you?</h1>
            <p className="mt-2 text-muted-foreground">Pick one to start. You can add more later.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {LANGUAGE_LIST.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    "group flex flex-col rounded-2xl border-2 p-6 text-left transition-all",
                    language === lang.id ? "border-brand bg-brand-soft shadow-lg" : "border-border bg-background/50 hover:border-brand/40"
                  )}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <span className="mt-4 font-display text-2xl font-bold">{lang.nativeName}</span>
                  <span className="text-sm text-muted-foreground">{lang.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl font-bold md:text-4xl">What's your goal?</h1>
            <p className="mt-2 text-muted-foreground">
              Pick up to <span className="font-semibold text-foreground">two</span> — we'll tailor lessons to what matters most to you.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => {
                const selected = goals.includes(g.id);
                const order = goals.indexOf(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all",
                      selected ? "border-brand bg-brand-soft" : "border-border bg-background/50 hover:border-brand/40"
                    )}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-semibold">{g.label}</div>
                      <div className="text-sm text-muted-foreground">{g.description}</div>
                    </div>
                    {selected && (
                      <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-brand text-[11px] font-bold text-brand-foreground shadow">
                        {order + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {goals.length}/2 selected{goals.length === 2 ? " · picking a third will replace your first choice" : ""}
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-3xl font-bold md:text-4xl">What's your current level?</h1>
            <p className="mt-2 text-muted-foreground">Honest is best — we'll adapt as you improve.</p>
            <div className="mt-8 space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border-2 p-5 text-left transition-all",
                    level === l.id ? "border-brand bg-brand-soft" : "border-border bg-background/50 hover:border-brand/40"
                  )}
                >
                  <div>
                    <div className="font-semibold">{l.label}</div>
                    <div className="text-sm text-muted-foreground">{l.description}</div>
                  </div>
                  {level === l.id && <Check className="size-5 text-brand" />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-display text-3xl font-bold md:text-4xl">How much time each day?</h1>
            <p className="mt-2 text-muted-foreground">A daily habit beats an occasional marathon.</p>
            <div className="mt-10 text-center">
              <div className="font-display text-7xl font-bold text-brand">{minutes}</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">minutes/day</div>
            </div>
            <div className="mt-8 px-4">
              <Slider min={5} max={60} step={5} value={[minutes]} onValueChange={(v) => setMinutes(v[0])} />
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>5 min · casual</span>
                <span>30 min · steady</span>
                <span>60 min · intense</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={next} disabled={!canNext} className="gap-1 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="gap-2 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Start learning
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
