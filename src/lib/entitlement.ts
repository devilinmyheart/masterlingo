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
  _supabase: SupabaseClient<any>,
  _userId: string,
): Promise<boolean> {
  // Payments temporarily disabled — every signed-in user gets full access.
  return true;
}

export async function assertPro(
  _supabase: SupabaseClient<any>,
  _userId: string,
): Promise<void> {
  // No-op while payments are disabled.
}
