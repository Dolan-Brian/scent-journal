import { supabase } from "@/lib/supabase";

export type FragranceRecommendation = {
  name: string;
  brand: string;
  reason: string;
};

export type PlantRecommendation = {
  name: string;
  scientific_name: string;
  reason: string;
};

export type RecommendationResult<T> = {
  pattern_summary: string;
  recommendations: T[];
};

export type FragranceRecommendationResult = RecommendationResult<FragranceRecommendation>;
export type PlantRecommendationResult = RecommendationResult<PlantRecommendation>;

/**
 * Calls the deployed "recommend-fragrance" edge function with the current
 * user's session. Surfaces the function's own error message (e.g. "No
 * fragrances rated 3 or higher yet") instead of a generic failure.
 */
export async function recommendFragrances(): Promise<FragranceRecommendationResult> {
  return invokeRecommendation<FragranceRecommendation>("recommend-fragrance");
}

/**
 * Calls the deployed "recommend-plant" edge function with the current
 * user's session. Uses the same auth and error-handling pattern as the
 * fragrance recommendation.
 */
export async function recommendPlants(): Promise<PlantRecommendationResult> {
  return invokeRecommendation<PlantRecommendation>("recommend-plant");
}

async function invokeRecommendation<T>(functionName: string): Promise<RecommendationResult<T>> {
  // Make sure we send the *user's* JWT, not just the publishable key.
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { data, error } = await supabase.functions.invoke<
    RecommendationResult<T> & { error?: string; message?: string }
  >(functionName, {
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
