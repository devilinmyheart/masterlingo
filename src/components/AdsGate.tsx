import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";

/**
 * Toggles a `pro-no-ads` class on <html> when the user is Pro so that
 * AdSense containers can be hidden via CSS.
 */
export function AdsGate() {
  const { isPro } = useSubscription();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("pro-no-ads", !!isPro);
  }, [isPro]);
  return null;
}
