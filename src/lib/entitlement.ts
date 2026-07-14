import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared "does this user have Pro" check used by both the client hook and
 * server-side gates on paid features. Considers subscriptions across BOTH
 * environments so a preview test-mode subscription still unlocks Pro when
 * the same account is used on the same deployment.
 *
 * Active if any subscription row is:
 *   - active / trialing / past_due, AND (no end date OR end date in future)
 *   - canceled with a still-in-the-future current_period_end (grace period)
 */

export type SubStatusRow = {
  status: string | null;
  current_period_end: string | null;
};

export function isRowActive(r: SubStatusRow): boolean {
  const end = r.current_period_end ? new Date(r.current_period_end) : null;
  const inFuture = !end || end.getTime() > Date.now();
  const status = (r.status ?? "").toLowerCase();
  if (["active", "trialing", "past_due"].includes(status) && inFuture) return true;
  if (status === "canceled" && end && end.getTime() > Date.now()) return true;
  return false;
}

/**
 * Query subscriptions for a user and return whether ANY row grants access.
 * Callers pass a Supabase client that is already scoped to the user (either
 * via RLS with a bearer token, or the requireSupabaseAuth middleware client).
 */
export async function userHasPro(
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("user_id", userId);
  if (error) {
    // Fail closed on unexpected errors so we never accidentally grant Pro.
    console.error("userHasPro query failed:", error.message);
    return false;
  }
  return (data ?? []).some(isRowActive);
}

/** Throw a 402-style error if the user is not Pro. */
export async function assertPro(
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<void> {
  if (!(await userHasPro(supabase, userId))) {
    throw new Error("This feature requires a Master Lingo Pro subscription.");
  }
}
