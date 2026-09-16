// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

interface FragranceRow {
  name: string;
  brand: string;
  my_rating: number | null;
  notes: string | null;
  perfumer: string | null;
}

console.info("recommend-plant function started");

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    // "user" mode verifies the caller's actual login token and populates
    // ctx.supabase with a client scoped to that real user, respecting RLS.
    // This is the correct auth mode - see recommend-fragrance/index.ts and
    // the learning note on why "publishable" mode does not work here.

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { data: fragrances, error: dbError } = await ctx.supabase
        .from("Fragrances")
        .select("name, brand, my_rating, notes, perfumer")
        .gte("my_rating", 3)
        .returns<FragranceRow[]>();

      if (dbError) {
        return Response.json({ error: dbError.message }, { status: 500 });
      }

      if (!fragrances || fragrances.length === 0) {
        return Response.json({
          error: "No fragrances rated 3 or higher yet. Log a few favorites first.",
        }, { status: 200 });
      }

      const fragranceList = fragrances
        .map(f => `- ${f.name} by ${f.brand}${f.perfumer ? ` (perfumer: ${f.perfumer})` : ""} (rated ${f.my_rating ?? "?"}/5)${f.notes ? `: "${f.notes}"` : ""}`)
        .join("\n");

      // Deliberately deadpan and serious in tone - this is a joke feature,
      // and the humor comes from treating an absurd request (plant
      // recommendations based on fragrance taste) with complete
      // professional seriousness, matching the tone of the real feature.
      const systemPrompt = `You are a horticultural consultant with an unusual specialty:
recommending houseplants based on a client's fragrance preferences. You take this work
completely seriously and treat the connection between scent profiles and plant
selection as a legitimate discipline. Given someone's highly-rated fragrances and
their personal notes about them, identify patterns in their scent preferences - warm
vs. fresh, animalic vs. clean, spicy vs. floral - and recommend exactly 3 houseplants
whose appearance, care profile, or natural scent genuinely reflect those same
qualities. Provide a serious, confident botanical rationale for each recommendation,
as if this were a rigorous, evidence-based methodology. Respond with ONLY valid JSON,
no markdown fences, matching exactly this shape:

{
  "pattern_summary": "1-2 sentences on the scent profile you identified, written seriously",
  "recommendations": [
    {"name": "...", "scientific_name": "...", "reason": "..."},
    {"name": "...", "scientific_name": "...", "reason": "..."},
    {"name": "...", "scientific_name": "...", "reason": "..."}
  ]
}`;

      const userMessage = `Here are my highly-rated fragrances:\n\n${fragranceList}\n\nWhat plants should I get?`;

      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!claudeRes.ok) {
        const errText = await claudeRes.text();
        return Response.json({ error: `Claude API error: ${errText}` }, { status: 502 });
      }

      const claudeData = await claudeRes.json();
      let rawText = claudeData.content[0].text.trim();
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

      const recommendation = JSON.parse(rawText);

      return Response.json(recommendation);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: `Server error: ${message}` }, { status: 500 });
    }
  }),
};