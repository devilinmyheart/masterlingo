import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CERTIFICATIONS } from "@/data/certifications";
import { LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Award, ExternalLink, Clock, DollarSign, Layers, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/certifications")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Certifications & Degrees — Master Lingo" },
      {
        name: "description",
        content:
          "Explore official certifications, exams and university degrees for the language you're learning — with duration, price and direct links.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/certifications" }],
  }),
  component: CertificationsPage,
});

function CertificationsPage() {
  const { data: onboarding, isLoading } = useQuery({
    queryKey: ["onboarding-language"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_onboarding")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const initial = (onboarding?.language as LanguageId | undefined) ?? "french";
  const [selected, setSelected] = useState<LanguageId>(initial);
  const active: LanguageId = selected ?? initial;
  const certs = CERTIFICATIONS[active] ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand">
          <Award className="size-4" /> Official pathways
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Certifications & degrees
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Ready to prove what you've learned? Here are the recognised exams, diplomas
          and university programs for your target language — with format, cost and
          direct links to enrol.
        </p>
      </header>

      {/* Language tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {LANGUAGE_LIST.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelected(lang.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              active === lang.id
                ? "border-brand bg-brand text-brand-foreground shadow-md shadow-brand/20"
                : "border-border bg-background/60 text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >
            <span className="text-base">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certs.map((c) => (
            <article
              key={c.name}
              className="glass-panel flex flex-col gap-4 rounded-2xl border border-border/60 p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                    {c.kind === "Degree" ? (
                      <GraduationCap className="size-3" />
                    ) : (
                      <Award className="size-3" />
                    )}
                    {c.kind}
                  </div>
                  <h2 className="font-display text-xl font-bold leading-tight">{c.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.provider}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground/80">{c.description}</p>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <Fact icon={<Layers className="size-3.5" />} label="Levels" value={c.levels} />
                <Fact icon={<Clock className="size-3.5" />} label="Duration" value={c.duration} />
                <Fact icon={<GraduationCap className="size-3.5" />} label="Format" value={c.format} />
                <Fact icon={<DollarSign className="size-3.5" />} label="Price" value={c.priceUSD} />
              </dl>

              <div className="mt-auto pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    Visit official page <ExternalLink className="ml-1.5 size-4" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
        Prices are shown in USD or local currency for reference and change over
        time. Always confirm the latest fees, dates and eligibility on the
        provider's official website before enrolling.{" "}
        <Link to="/learn" className="font-semibold text-brand hover:underline">
          Back to lessons →
        </Link>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="mt-1 text-xs font-semibold leading-snug text-foreground">{value}</dd>
    </div>
  );
}
