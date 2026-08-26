// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

interface FragranceRow {
  name: string;
  brand: string;
  my_rating: number | null;
  notes: string | null;
}

console.info("recommend-fragrance function started");

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    // "publishable" mode respects Row Level Security - this function only
    // ever sees the currently logged-in user's own fragrance data, never
    // anyone else's, and never bypasses RLS the way "secret" mode would.

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Step 1: fetch this user's own fragrances, rated 3 or higher
      // ctx.supabase is a client already scoped to the logged-in user
      const { data: fragrances, error: dbError } = await ctx.supabase
        .from("fragrances")
        .select("name, brand, my_rating, notes, perfumer")
        .gte("my_rating", 3);

      if (dbError) {
        return Response.json({ error: dbError.message }, { status: 500 });
      }

      if (!fragrances || fragrances.length === 0) {
        return Response.json({
          error: "No fragrances rated 3 or higher yet. Log a few favorites first.",
        }, { status: 200 });
      }

      // Step 2: build the prompt from real, personal data only.
      // Notably: no user_id, no email, no account info of any kind is
      // included here - only fragrance name, brand, rating, and notes.
      const fragranceList = fragrances
        .map(f => `- ${f.name} by ${f.brand}${f.perfumer ? ` (perfumer: ${f.perfumer})` : ""} (rated ${f.my_rating}/5)${f.notes ? `: "${f.notes}"` : ""}`)
        .join("\n");

      const systemPrompt = `You are a knowledgeable fragrance expert. Given someone's
highly-rated fragrances and their personal notes about them, identify real
patterns in what they like - specific notes, accords, families, styles, or
even recurring perfumers whose work they seem drawn to - and suggest exactly
3 new fragrances they haven't listed, with a short, specific reason for each
recommendation tied to their actual stated preferences. Be specific and
grounded, not generic. Respond with ONLY valid JSON, no markdown fences,
matching exactly this shape:

{
  "pattern_summary": "1-2 sentences on what you noticed they tend to like",
  "recommendations": [
    {"name": "...", "brand": "...", "reason": "..."},
    {"name": "...", "brand": "...", "reason": "..."},
    {"name": "...", "brand": "...", "reason": "..."}
  ]
}`;

      const userMessage = `Here are my highly-rated fragrances:\n\n${fragranceList}\n\nWhat should I try next?`;

      // Step 3: call Claude directly via fetch - same pattern as Andiamo,
      // no SDK dependency needed.
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
      return Response.json({ error: `Server error: ${err.message}` }, { status: 500 });
    }
  }),
};
