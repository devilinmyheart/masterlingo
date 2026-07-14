import { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

export function UpgradeGate({
  feature,
  description,
  children,
}: {
  feature: string;
  description?: string;
  children?: ReactNode;
}) {
  const { isPro, isLoading } = useSubscription();
  const { openCheckout, loading } = usePaddleCheckout();

  if (isLoading) return null;
  if (isPro) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="glass-panel rounded-3xl p-10 text-center shadow-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">{feature} is a Pro feature</h1>
        <p className="mt-3 text-muted-foreground">
          {description ?? "Unlock all 5 languages, unlimited AI tutor, speaking practice, and an ad-free experience."}
        </p>
        <div className="mt-8 rounded-2xl bg-brand-soft/60 p-4 text-sm">
          <div className="font-display text-3xl font-bold">$1<span className="text-base font-normal opacity-60">/month</span></div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">7-day free trial</div>
        </div>
        <Button
          onClick={() => openCheckout({ priceId: "pro_monthly" })}
          disabled={loading}
          className="mt-6 gap-2 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Sparkles className="size-4" />
          {loading ? "Opening checkout…" : "Start free trial"}
        </Button>
      </div>
    </div>
  );
}
