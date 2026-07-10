import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenCheck, Sparkles, Loader2, Volume2, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { reviewWord, reviewGrammar, type WordReview, type GrammarReview } from "@/lib/review.functions";
import { useVoicePrefs, speakWithSlot } from "@/lib/voice-prefs";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Word & Grammar Review — LingoMaster" },
      { name: "description", content: "Deep-dive AI reviews of any word or grammar point in your target language, with examples, pitfalls and a quick check." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/review" }],
  }),
  component: ReviewPage,
});

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function ReviewPage() {
  const [mode, setMode] = useState<"word" | "grammar">("word");
  const [language, setLanguage] = useState<LanguageId>("english");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("A2");
  const [query, setQuery] = useState("");
  const [wordResult, setWordResult] = useState<WordReview | null>(null);
  const [grammarResult, setGrammarResult] = useState<GrammarReview | null>(null);
  const [prefs] = useVoicePrefs();

  const wordFn = useServerFn(reviewWord);
  const grammarFn = useServerFn(reviewGrammar);

  const wordMut = useMutation({
    mutationFn: (v: { language: LanguageId; word: string; level: string }) => wordFn({ data: v }),
    onSuccess: (d) => { setWordResult(d); setGrammarResult(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Review failed"),
  });
  const grammarMut = useMutation({
    mutationFn: (v: { language: LanguageId; topic: string; level: string }) => grammarFn({ data: v }),
    onSuccess: (d) => { setGrammarResult(d); setWordResult(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Review failed"),
  });

  const busy = wordMut.isPending || grammarMut.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    if (mode === "word") wordMut.mutate({ language, word: query.trim(), level });
    else grammarMut.mutate({ language, topic: query.trim(), level });
  }

  function speak(text: string) {
    if (language === "english") return speakWithSlot(text, prefs.english);
    if (language === "hindi_english") return speakWithSlot(text, prefs.hindi_english.target);
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "french" ? "fr-FR" : language === "german" ? "de-DE" : "ja-JP";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  function speakGloss(text: string) {
    if (language === "hindi_english") speakWithSlot(text, prefs.hindi_english.gloss);
  }

  const suggestions =
    mode === "word"
      ? (language === "hindi_english" || language === "english"
          ? ["schedule", "although", "opportunity", "actually"]
          : language === "french"
            ? ["bonjour", "avoir", "cependant", "quotidien"]
            : language === "german"
              ? ["Freundschaft", "obwohl", "sich freuen", "Bahnhof"]
              : ["ありがとう", "食べる", "しかし", "電車"])
      : (language === "hindi_english" || language === "english"
          ? ["present perfect vs past simple", "articles a / an / the", "modal verbs (can, could, would)", "reported speech"]
          : language === "french"
            ? ["passé composé vs imparfait", "subjonctif", "pronoms COD/COI", "accord du participe passé"]
            : language === "german"
              ? ["nominative vs accusative", "modal verbs", "separable prefix verbs", "subordinate clauses (weil/dass)"]
              : ["は vs が", "て-form", "polite (です/ます) vs plain", "conditional (たら/ば)"]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-brand to-japanese text-white shadow-lg">
          <BookOpenCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Word &amp; Grammar Review</h1>
          <p className="text-sm text-muted-foreground">Deep dive on any word or rule — explained in the right language for your track.</p>
        </div>
      </header>

      {/* Mode tabs */}
      <div className="mb-4 inline-flex rounded-full border border-border bg-background p-1">
        {(["word", "grammar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all",
              mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m} review
          </button>
        ))}
      </div>

      {/* Language + level */}
      <div className="glass-panel mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap gap-1">
          {LANGUAGE_LIST.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                language === l.id ? "border-transparent bg-foreground text-background" : "border-border hover:bg-accent"
              )}
            >
              <span>{l.flag}</span> {l.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Level</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Query */}
      <form onSubmit={submit} className="glass-panel rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "word" ? "Enter a word to review" : "Enter a grammar topic (e.g. present perfect)"}
            className="flex-1 min-w-[220px]"
          />
          <Button type="submit" disabled={busy || !query.trim()} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {busy ? <><Loader2 className="mr-2 size-4 animate-spin" /> Reviewing…</> : <><Sparkles className="mr-2 size-4" /> Review</>}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {wordResult && (
          <motion.section
            key={"word-" + wordResult.headword}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-3xl font-bold">{wordResult.headword}</h2>
                    <button onClick={() => speak(wordResult.headword)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Speak">
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {wordResult.partOfSpeech} · {wordResult.pronunciation}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed">{wordResult.meaning}</p>
            </div>

            <ExampleList items={wordResult.examples} onSpeak={speak} onSpeakGloss={language === "hindi_english" ? speakGloss : undefined} />

            <div className="grid gap-4 md:grid-cols-2">
              <PanelList title="Collocations" items={wordResult.collocations} />
              <PanelList title="Common mistakes" items={wordResult.commonMistakes} icon={<AlertTriangle className="size-4 text-amber-600" />} />
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
                <Lightbulb className="size-4 text-brand" /> Memory tip
              </div>
              <p className="text-sm">{wordResult.memoryTip}</p>
            </div>
          </motion.section>
        )}

        {grammarResult && (
          <motion.section
            key={"grammar-" + grammarResult.title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="font-display text-2xl font-bold">{grammarResult.title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{grammarResult.summary}</p>
              <div className="mt-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">When to use</div>
                <ul className="space-y-1 text-sm">
                  {grammarResult.whenToUse.map((w, i) => (
                    <li key={i} className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <h3 className="mb-3 font-display text-lg font-bold">Rules &amp; examples</h3>
              <ol className="space-y-3">
                {grammarResult.rules.map((r, i) => (
                  <li key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-start gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{r.rule}</p>
                        <div className="mt-2 rounded-lg bg-brand-soft p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-brand">{r.example.text}</p>
                            <div className="flex shrink-0 gap-1">
                              <button onClick={() => speak(r.example.text)} className="rounded p-1 text-brand/70 hover:bg-white/40" aria-label="Speak"><Volume2 className="size-3.5" /></button>
                              {language === "hindi_english" && (
                                <button onClick={() => speakGloss(r.example.translation)} className="rounded p-1 text-hindi hover:bg-white/40" aria-label="Speak Hindi"><Volume2 className="size-3.5" /></button>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-brand/80">{r.example.translation}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-2xl p-5">
                <div className="mb-2 font-display text-lg font-bold">Contrast</div>
                <p className="text-sm">{grammarResult.contrast}</p>
              </div>
              <PanelList title="Pitfalls" items={grammarResult.pitfalls} icon={<AlertTriangle className="size-4 text-amber-600" />} />
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
                <ArrowRight className="size-4 text-brand" /> Quick check
              </div>
              <p className="text-sm font-semibold">{grammarResult.quickCheck.question}</p>
              <details className="mt-2 rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">Show answer</summary>
                <p className="mt-2 text-sm">{grammarResult.quickCheck.answer}</p>
              </details>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelList({ title, items, icon }: { title: string; items: string[]; icon?: React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-2 flex items-center gap-2 font-display text-lg font-bold">{icon}{title}</div>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ExampleList({
  items,
  onSpeak,
  onSpeakGloss,
}: {
  items: { text: string; translation: string }[];
  onSpeak: (text: string) => void;
  onSpeakGloss?: (text: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="mb-3 font-display text-lg font-bold">Examples</h3>
      <ul className="space-y-3">
        {items.map((ex, i) => (
          <li key={i} className="rounded-xl border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{ex.text}</p>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => onSpeak(ex.text)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Speak"><Volume2 className="size-4" /></button>
                {onSpeakGloss && (
                  <button onClick={() => onSpeakGloss(ex.translation)} className="rounded p-1.5 text-hindi hover:bg-accent" aria-label="Speak translation"><Volume2 className="size-4" /></button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ex.translation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
