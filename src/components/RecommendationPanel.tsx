import { useMutation } from "@tanstack/react-query";
import { Loader2, FlaskConical } from "lucide-react";
import { recommendFragrances } from "@/lib/recommend";
import { Button } from "@/components/ui/button";

export function RecommendationPanel() {
  const { mutate, data, error, isPending } = useMutation({
    mutationFn: recommendFragrances,
  });

  return (
    <section className="mt-10 border-t border-brass/40 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">The Perfumer's Counsel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A reading of your ledger, with three suggestions to seek out next.
          </p>
        </div>
        <Button variant="secondary" onClick={() => mutate()} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Consulting the ledger…
            </>
          ) : (
            <>
              <FlaskConical className="size-4" aria-hidden />
              Recommend a New Fragrance
            </>
          )}
        </Button>
      </div>

      {isPending && (
        <div
          className="mt-6 border border-dashed border-brass/60 bg-card/60 p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="font-display text-lg italic text-muted-foreground">
            Decanting your notes…
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            One moment
          </p>
        </div>
      )}

      {error && !isPending && (
        <div className="mt-6 border border-destructive/40 bg-destructive/5 p-5" role="alert">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-destructive">
            Nothing to recommend
          </p>
          <p className="mt-2 font-body text-sm text-foreground">{(error as Error).message}</p>
        </div>
      )}

      {data && !isPending && (
        <div className="mt-6">
          {data.pattern_summary && (
            <figure className="border-l-2 border-brass pl-5">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-sage">
                From the journal
              </p>
              <blockquote className="mt-2 max-w-2xl font-display text-xl leading-relaxed italic text-foreground">
                {data.pattern_summary}
              </blockquote>
            </figure>
          )}

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec, i) => (
              <li
                key={`${rec.brand}-${rec.name}-${i}`}
                className="relative border-2 border-brass/70 bg-card p-1 shadow-[0_1px_0_0_rgba(43,38,32,0.06)]"
              >
                <article className="flex h-full flex-col border border-brass/40 px-5 py-6 text-center">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sage">
                    No. {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">
                    {rec.name}
                  </h3>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.24em] text-amber">
                    {rec.brand}
                  </p>
                  <div
                    className="mx-auto my-4 h-px w-10 bg-brass/70"
                    aria-hidden
                  />
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {rec.reason}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
