import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Volume2, Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { speakWithSlot, useVoicePrefs } from "@/lib/voice-prefs";

export const Route = createFileRoute("/_authenticated/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary — Master Lingo" },
      { name: "description", content: "Your personal notebook of saved words and phrases with native pronunciation across French, German, and Japanese." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/vocabulary" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(vocabQuery),
  component: Vocabulary,
});

const vocabQuery = queryOptions({
  queryKey: ["vocabulary"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("vocabulary_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

function Vocabulary() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(vocabQuery);
  const [filter, setFilter] = useState<LanguageId | "all">("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", translation: "", language: "french" as LanguageId });
  const [voicePrefs] = useVoicePrefs();

  const visible = items.filter((i) => {
    if (filter !== "all" && i.language !== filter) return false;
    if (query && !`${i.word} ${i.translation}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function toggleFav(id: string, favorite: boolean) {
    await supabase.from("vocabulary_items").update({ favorite: !favorite }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["vocabulary"] });
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.translation.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("vocabulary_items").insert({
      user_id: user.id,
      word: newWord.word.trim(),
      translation: newWord.translation.trim(),
      language: newWord.language,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Word added");
      setNewWord({ word: "", translation: "", language: newWord.language });
      setAdding(false);
      qc.invalidateQueries({ queryKey: ["vocabulary"] });
    }
  }

  function speak(text: string, lang: LanguageId) {
    if (lang === "english") return speakWithSlot(text, voicePrefs.english);
    if (lang === "hindi_english") return speakWithSlot(text, voicePrefs.hindi_english.target);
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang =
      lang === "french" ? "fr-FR" :
      lang === "german" ? "de-DE" :
      lang === "korean" ? "ko-KR" :
      "ja-JP";
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">Vocabulary</h1>
          <p className="mt-1 text-muted-foreground">{items.length} words in your notebook</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="gap-2 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-4" /> Add word
        </Button>
      </div>

      {adding && (
        <form onSubmit={addWord} className="glass-panel mt-6 grid gap-3 rounded-2xl p-4 shadow-sm md:grid-cols-4">
          <Input placeholder="Word (e.g. bonjour)" value={newWord.word} onChange={(e) => setNewWord({ ...newWord, word: e.target.value })} />
          <Input placeholder="Translation" value={newWord.translation} onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })} />
          <select
            value={newWord.language}
            onChange={(e) => setNewWord({ ...newWord, language: e.target.value as LanguageId })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {LANGUAGE_LIST.map((l) => (
              <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
            ))}
          </select>
          <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">Save</Button>
        </form>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search words or translations" className="pl-9" />
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-background p-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
          {LANGUAGE_LIST.map((l) => (
            <FilterChip key={l.id} active={filter === l.id} onClick={() => setFilter(l.id)}>
              {l.flag} {l.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="glass-panel mt-10 rounded-3xl p-12 text-center">
          <div className="text-4xl">📚</div>
          <p className="mt-4 font-semibold">No words yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Complete lessons or add words manually to build your vocabulary.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v) => {
            const mastery = v.mastery ?? 0;
            const lang = v.language as LanguageId;
            const chip = lang === "french" ? "bg-french-soft text-french" : lang === "german" ? "bg-german-soft text-german-ink" : "bg-japanese-soft text-japanese";
            return (
              <div key={v.id} className="glass-panel group rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", chip)}>{lang}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="font-display text-2xl font-bold">{v.word}</div>
                      <button onClick={() => speak(v.word, lang)} className="text-muted-foreground hover:text-foreground">
                        <Volume2 className="size-4" />
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">{v.translation}</div>
                    {v.pronunciation && <div className="mt-1 font-mono text-xs text-muted-foreground">{v.pronunciation}</div>}
                  </div>
                  <button onClick={() => toggleFav(v.id, v.favorite)} className="text-muted-foreground hover:text-german" aria-label="Toggle favorite">
                    <Star className={cn("size-5 transition-colors", v.favorite && "fill-german text-german")} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Mastery</span><span>{mastery}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-brand" style={{ width: `${mastery}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
