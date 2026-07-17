import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

const TITLE = "French Conjugation Guide: Être, Avoir & Aller (2026)";
const DESCRIPTION =
  "Master French conjugation with AI. Present tense, passé composé and futur proche for être, avoir and aller — the three verbs behind ~40% of French sentences.";
const URL = "https://masterlingo.lovable.app/blog/french-conjugation-guide";

export const Route = createFileRoute("/blog/french-conjugation-guide")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "french conjugation, être conjugation, avoir conjugation, aller conjugation, passé composé, french verbs, learn french" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Person", name: "Mohammad Saduddin Atahar" },
          publisher: { "@type": "Organization", name: "Master Lingo" },
          datePublished: "2026-07-17",
          dateModified: "2026-07-17",
          mainEntityOfPage: URL,
          about: ["French conjugation", "être", "avoir", "aller", "Passé composé"],
        }),
      },
    ],
  }),
  component: FrenchConjugationGuide,
});

type Row = { pronoun: string; value: string };
type Table = { title: string; rows: Row[]; note?: string };

const etreTables: Table[] = [
  {
    title: "Être — Present (I am, you are…)",
    rows: [
      { pronoun: "je", value: "suis" },
      { pronoun: "tu", value: "es" },
      { pronoun: "il / elle / on", value: "est" },
      { pronoun: "nous", value: "sommes" },
      { pronoun: "vous", value: "êtes" },
      { pronoun: "ils / elles", value: "sont" },
    ],
  },
  {
    title: "Être — Passé composé (I was / have been)",
    note: "Uses avoir as auxiliary: j'ai été.",
    rows: [
      { pronoun: "j'", value: "ai été" },
      { pronoun: "tu", value: "as été" },
      { pronoun: "il / elle", value: "a été" },
      { pronoun: "nous", value: "avons été" },
      { pronoun: "vous", value: "avez été" },
      { pronoun: "ils / elles", value: "ont été" },
    ],
  },
];

const avoirTables: Table[] = [
  {
    title: "Avoir — Present (I have, you have…)",
    rows: [
      { pronoun: "j'", value: "ai" },
      { pronoun: "tu", value: "as" },
      { pronoun: "il / elle / on", value: "a" },
      { pronoun: "nous", value: "avons" },
      { pronoun: "vous", value: "avez" },
      { pronoun: "ils / elles", value: "ont" },
    ],
  },
  {
    title: "Avoir — Passé composé (I had / have had)",
    rows: [
      { pronoun: "j'", value: "ai eu" },
      { pronoun: "tu", value: "as eu" },
      { pronoun: "il / elle", value: "a eu" },
      { pronoun: "nous", value: "avons eu" },
      { pronoun: "vous", value: "avez eu" },
      { pronoun: "ils / elles", value: "ont eu" },
    ],
  },
];

const allerTables: Table[] = [
  {
    title: "Aller — Present (I go, you go…)",
    rows: [
      { pronoun: "je", value: "vais" },
      { pronoun: "tu", value: "vas" },
      { pronoun: "il / elle / on", value: "va" },
      { pronoun: "nous", value: "allons" },
      { pronoun: "vous", value: "allez" },
      { pronoun: "ils / elles", value: "vont" },
    ],
  },
  {
    title: "Aller — Passé composé (I went)",
    note: "Uses être as auxiliary and agrees with the subject: je suis allé(e).",
    rows: [
      { pronoun: "je", value: "suis allé(e)" },
      { pronoun: "tu", value: "es allé(e)" },
      { pronoun: "il / elle", value: "est allé(e)" },
      { pronoun: "nous", value: "sommes allé(e)s" },
      { pronoun: "vous", value: "êtes allé(e)(s)" },
      { pronoun: "ils / elles", value: "sont allé(e)s" },
    ],
  },
  {
    title: "Aller — Futur proche (I'm going to…)",
    note: "Aller + infinitive expresses near-future actions: je vais manger.",
    rows: [
      { pronoun: "je vais", value: "+ infinitive" },
      { pronoun: "tu vas", value: "+ infinitive" },
      { pronoun: "il / elle va", value: "+ infinitive" },
      { pronoun: "nous allons", value: "+ infinitive" },
      { pronoun: "vous allez", value: "+ infinitive" },
      { pronoun: "ils / elles vont", value: "+ infinitive" },
    ],
  },
];

function TableCard({ table }: { table: Table }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="font-display text-xl font-bold">{table.title}</h3>
      {table.note && <p className="mt-1 text-sm text-muted-foreground">{table.note}</p>}
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <tbody>
            {table.rows.map((r) => (
              <tr key={r.pronoun} className="border-b border-border last:border-b-0 odd:bg-muted/30">
                <td className="w-1/2 px-4 py-2 font-medium text-muted-foreground">{r.pronoun}</td>
                <td className="px-4 py-2 font-semibold text-foreground">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FrenchConjugationGuide() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="px-2">/</span>
        <span>Blog</span>
      </nav>

      <header>
        <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
          <Sparkles className="size-3" /> AI Grammar Guide
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          French Conjugation Guide: Être, Avoir &amp; Aller
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Three verbs power roughly 40% of everyday French sentences. Learn them once
          — with the help of your AI tutor — and unlock the rest of the language.
        </p>
      </header>

      <section className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        <h2>Why start with être, avoir and aller?</h2>
        <p>
          These three irregular verbs appear constantly: <em>être</em> (to be) forms
          identity and states, <em>avoir</em> (to have) is the most common auxiliary
          in the passé composé, and <em>aller</em> (to go) builds the futur proche —
          the go-to future tense in spoken French. Master them and you already speak
          in three tenses.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-bold">1. Être — to be</h2>
        {etreTables.map((t) => <TableCard key={t.title} table={t} />)}
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-bold">2. Avoir — to have</h2>
        {avoirTables.map((t) => <TableCard key={t.title} table={t} />)}
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-bold">3. Aller — to go</h2>
        {allerTables.map((t) => <TableCard key={t.title} table={t} />)}
      </section>

      <section className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
        <h2>How Master Lingo helps you retain conjugations</h2>
        <p>
          Reading a table is easy — remembering it in conversation is the hard part.
          Master Lingo's AI tutor drills these forms in context: it asks you to
          rewrite English sentences in French, corrects your endings, and roleplays
          real scenarios so <em>je suis</em>, <em>j'ai</em> and <em>je vais</em>
          become automatic.
        </p>
      </section>

      <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-foreground p-8 text-center text-background">
        <p className="text-lg">Ready to conjugate on autopilot?</p>
        <Link
          to="/auth"
          search={{ mode: "signup" }}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-xl shadow-brand/40 hover:bg-brand/90"
        >
          Start free with Master Lingo <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
