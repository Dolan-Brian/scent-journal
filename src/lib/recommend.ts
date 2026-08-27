import { supabase } from "@/lib/supabase";

export type Recommendation = {
  name: string;
  brand: string;
  reason: string;
};

export type RecommendationResult = {
  pattern_summary: string;
  recommendations: Recommendation[];
};

/**
 * Calls the deployed "recommend-fragrance" edge function with the current
 * user's session. Surfaces the function's own error message (e.g. "No
 * fragrances rated 3 or higher yet") instead of a generic failure.
 */
export async function recommendFragrances(): Promise<RecommendationResult> {
  // Make sure we send the *user's* JWT, not just the publishable key.
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { data, error } = await supabase.functions.invoke<
    RecommendationResult & { error?: string; message?: string }
  >("recommend-fragrance", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    throw new Error(await extractFunctionErrorMessage(error));
  }

  if (!data) throw new Error("The recommendation service returned nothing.");
  if (data.error) throw new Error(data.error);
  if (!Array.isArray(data.recommendations)) {
    throw new Error(data.message ?? "The recommendation service returned an unexpected response.");
  }

  return { pattern_summary: data.pattern_summary ?? "", recommendations: data.recommendations };
}

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  const context = (error as { context?: unknown }).context;

  if (context instanceof Response) {
    try {
      const text = await context.clone().text();
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        const message = parsed["error"] ?? parsed["message"] ?? parsed["msg"];
        if (typeof message === "string" && message.trim()) return message;
      } catch {
        if (text.trim()) return text.trim();
      }
    } catch {
      /* fall through to the generic message below */
    }
  }

  const message = (error as Error).message;
  return message && message !== "Edge Function returned a non-2xx status code"
    ? message
    : "Couldn't reach the recommendation service. Please try again.";
}
