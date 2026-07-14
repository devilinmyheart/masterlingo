import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TranslateExerciseProps {
  /** Phrase in the language being learned (shown in the character bubble). */
  phrase: string;
  /** Correct translation in the learner's native language. */
  phraseTranslation: string;
  /** Label for the prompt, e.g. "Write this in English" or "इसे हिंदी में लिखें". */
  promptLabel: string;
  /** Play the target-language phrase aloud. */
  onSpeak: () => void;
  /** Distractor words pulled from the current deck (native language). */
  distractorPool: string[];
  onResult: (correct: boolean) => void;
  isLast: boolean;
}

type Tile = { id: number; text: string };

// Split "A tea?" -> ["A", "tea?"] keeping punctuation attached.
function tokenize(sentence: string): string[] {
  return sentence
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[.,!?;:।]/g, "").trim();
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function TranslateExercise({
  phrase,
  phraseTranslation,
  promptLabel,
  onSpeak,
  distractorPool,
  onResult,
  isLast,
}: TranslateExerciseProps) {
  const answerTokens = useMemo(() => tokenize(phraseTranslation), [phraseTranslation]);

  const tiles = useMemo<Tile[]>(() => {
    const correct = answerTokens.map((t, i) => ({ id: i, text: t }));
    const distractorTokens: string[] = [];
    const seen = new Set(answerTokens.map(normalize));
    for (const d of distractorPool) {
      for (const tok of tokenize(d)) {
        const key = normalize(tok);
        if (key && !seen.has(key)) {
          seen.add(key);
          distractorTokens.push(tok);
          if (distractorTokens.length >= Math.min(3, Math.max(2, answerTokens.length))) break;
        }
      }
      if (distractorTokens.length >= 3) break;
    }
    const distractorTiles = distractorTokens.map((t, i) => ({ id: 1000 + i, text: t }));
    const seed = phrase.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return seededShuffle([...correct, ...distractorTiles], seed);
  }, [answerTokens, distractorPool, phrase]);

  const [placedIds, setPlacedIds] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [shake, setShake] = useState(0);

  const placed = placedIds.map((id) => tiles.find((t) => t.id === id)!).filter(Boolean);
  const isPlaced = (id: number) => placedIds.includes(id);

  function place(id: number) {
    if (status !== "idle") return;
    if (isPlaced(id)) return;
    setPlacedIds((p) => [...p, id]);
  }
  function remove(id: number) {
    if (status !== "idle") return;
    setPlacedIds((p) => p.filter((x) => x !== id));
  }

  function check() {
    const attempt = placed.map((t) => t.text).join(" ");
    if (normalize(attempt) === normalize(phraseTranslation)) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setShake((n) => n + 1);
    }
  }

  function proceed() {
    onResult(status === "correct");
  }

  const canCheck = placed.length > 0 && status === "idle";

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-brand">Translate</div>
      <div className="mt-2 font-display text-2xl font-bold md:text-3xl">{promptLabel}</div>

      {/* Character bubble */}
      <div className="mt-6 flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-soft text-3xl sm:size-20">
          🦉
        </div>
        <div className="relative flex-1">
          <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 shadow-sm">
            <button
              onClick={onSpeak}
              className="mr-2 inline-flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              aria-label="Play phrase"
            >
              <Volume2 className="size-4" />
            </button>
            <span className="font-display text-xl font-semibold">{phrase}</span>
          </div>
        </div>
      </div>

      {/* Answer tray */}
      <motion.div
        key={shake}
        animate={status === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "mt-8 min-h-16 rounded-2xl border-2 border-dashed p-3",
          status === "correct" && "border-green-500 bg-green-500/10",
          status === "wrong" && "border-destructive bg-destructive/10",
          status === "idle" && "border-border bg-background/40",
        )}
      >
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {placed.map((t) => (
              <motion.button
                key={t.id}
                layout
                initial={{ scale: 0.6, opacity: 0, y: -6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                onClick={() => remove(t.id)}
                className="rounded-xl border-2 border-border bg-card px-4 py-2 text-base font-semibold shadow-sm hover:border-brand"
              >
                {t.text}
              </motion.button>
            ))}
          </AnimatePresence>
          {placed.length === 0 && (
            <div className="px-2 py-2 text-sm text-muted-foreground">Tap the words below to build the sentence.</div>
          )}
        </div>
      </motion.div>

      {/* Word bank */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tiles.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => place(t.id)}
            disabled={isPlaced(t.id) || status !== "idle"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: isPlaced(t.id) ? 0.25 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className={cn(
              "rounded-xl border-2 border-border bg-background/70 px-4 py-2 text-base font-semibold shadow-[0_3px_0_0_hsl(var(--border))] transition-all",
              !isPlaced(t.id) && status === "idle" && "hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft",
              isPlaced(t.id) && "pointer-events-none",
            )}
          >
            {t.text}
          </motion.button>
        ))}
      </div>

      {/* Feedback + actions */}
      {status !== "idle" && (
        <div
          className={cn(
            "mt-6 rounded-2xl border p-4",
            status === "correct" ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5",
          )}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {status === "correct" ? (
              <><Check className="size-4 text-green-600" /> Great — that's it!</>
            ) : (
              <>
                <X className="size-4 text-destructive" /> Not quite — the answer is
                <span className="ml-1 font-bold">{phraseTranslation}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {status === "idle" ? (
          <Button
            onClick={check}
            disabled={!canCheck}
            className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
          >
            Check
          </Button>
        ) : (
          <Button onClick={proceed} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90">
            {isLast ? "Finish lesson" : "Next word"}
          </Button>
        )}
      </div>
    </div>
  );
}
