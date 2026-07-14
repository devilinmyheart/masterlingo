import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useSubscription } from "@/hooks/useSubscription";
import { openCustomerPortal } from "@/utils/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

/**
 * Shown at the top of every page when the user's subscription is in the
 * `past_due` state (Paddle is retrying payment). Access continues during
 * Paddle's dunning window; this banner just prompts the user to fix the card.
 */
export function PastDueBanner() {
  const { isPastDue } = useSubscription();
  const portalFn = useServerFn(openCustomerPortal);
  const [loading, setLoading] = useState(false);

  if (!isPastDue) return null;

  async function updatePayment() {
    setLoading(true);
    try {
      const { url } = await portalFn({ data: { environment: getPaddleEnvironment() } });
      if (url) window.open(url, "_blank");
      else toast.error("Could not open billing portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          Your last payment couldn't be processed. Update your payment method to keep Pro access.
        </span>
        <button
          onClick={updatePayment}
          disabled={loading}
          className="underline font-semibold hover:no-underline disabled:opacity-60"
        >
          {loading ? "Opening…" : "Update payment method"}
        </button>
      </div>
    </div>
  );
}
