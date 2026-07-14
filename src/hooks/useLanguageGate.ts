import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGE_LIST, type LanguageId } from "@/data/curriculum";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

/**
 * Free users are limited to a single language (the one they chose during
 * onboarding). Pro unlocks all five. This hook returns the set of allowed
 * language IDs plus a `gate` helper that returns true when the user is
 * allowed to use `lang`, or false + prompts an upgrade toast/checkout when
 * they aren't.
 */
export function useLanguageGate() {
  const { isPro, isLoading: subLoading } = useSubscription();
  const { openCheckout } = usePaddleCheckout();
  const [onboardingLang, setOnboardingLang] = useState<LanguageId | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("user_onboarding")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setOnboardingLang((data?.language as LanguageId | undefined) ?? null);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allowed: Set<LanguageId> = isPro
    ? new Set(LANGUAGE_LIST.map((l) => l.id))
    : new Set(onboardingLang ? [onboardingLang] : []);

  const gate = useCallback(
    (lang: LanguageId): boolean => {
      if (isPro) return true;
      if (!onboardingLang || onboardingLang === lang) return true;
      toast.info("Learning multiple languages is a Pro feature.", {
        description: "Unlock all 5 languages for $1/month with a 7-day free trial.",
        action: {
          label: "Upgrade",
          onClick: () => openCheckout({ priceId: "pro_monthly" }),
        },
      });
      return false;
    },
    [isPro, onboardingLang, openCheckout],
  );

  return {
    isPro,
    isLoading: subLoading || !loaded,
    onboardingLang,
    allowed,
    gate,
    isAllowed: (lang: LanguageId) => allowed.has(lang),
  };
}
