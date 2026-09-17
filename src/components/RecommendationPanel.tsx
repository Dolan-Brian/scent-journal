import { useMutation } from "@tanstack/react-query";
import { Loader2, FlaskConical, Leaf } from "lucide-react";
import {
  recommendFragrances,
  recommendPlants,
  type FragranceRecommendationResult,
  type PlantRecommendationResult,
} from "@/lib/recommend";
import { Button } from "@/components/ui/button";

type RecommendationKind = "fragrance" | "plant";

export function RecommendationPanel() {
  const fragrance = useMutation({
    mutationFn: recommendFragrances,
  });
  const plant = useMutation({
    mutationFn: recommendPlants,
  });

  const activeKind: RecommendationKind | null =
    fragrance.isPending || fragrance.data || fragrance.error
      ? "fragrance"
      : plant.isPending || plant.data || plant.error
        ? "plant"
        : null;

  const isPending = fragrance.isPending || plant.isPending;

  return (
    <section className="mt-10 border-t border-brass/40 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">The Perfumer's Counsel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A reading of your ledger, with suggestions drawn from what you've recorded.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              plant.reset();
              fragrance.mutate();
            }}
            disabled={isPending}
          >
            {fragrance.isPending ? (
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
          <Button
            variant="secondary"
            onClick={() => {
              fragrance.reset();
              plant.mutate();
            }}
            disabled={isPending}
          >
            {plant.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Consulting the ledger…
              </>
            ) : (
              <>
                <Leaf className="size-4" aria-hidden />
                Recommend a New Plant
              </>
            )}
          </Button>
        </div>
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

      {activeKind === "fragrance" && fragrance.error && !fragrance.isPending && (
        <RecommendationError message={(fragrance.error as Error).message} />
      )}

      {activeKind === "plant" && plant.error && !plant.isPending && (
        <RecommendationError message={(plant.error as Error).message} />
      )}

      {activeKind === "fragrance" && fragrance.data && !fragrance.isPending && (
        <FragranceResults data={fragrance.data} />
      )}

      {activeKind === "plant" && plant.data && !plant.isPending && (
        <PlantResults data={plant.data} />
      )}
    </section>
  );
}

function RecommendationError({ message }: { message: string }) {
  return (
    <div className="mt-6 border border-destructive/40 bg-destructive/5 p-5" role="alert">
      <p className="text-[0.7rem] uppercase tracking-[0.2em] text-destructive">
        Nothing to recommend
      </p>
      <p className="mt-2 font-body text-sm text-foreground">{message}</p>
    </div>
  );
}

function FragranceResults({ data }: { data: FragranceRecommendationResult }) {
  return (
    <RecommendationResults
      patternSummary={data.pattern_summary}
      label="From the journal"
      items={data.recommendations.map((rec) => ({
        title: rec.name,
        subtitle: rec.brand,
        body: rec.reason,
      }))}
    />
  );
}

function PlantResults({ data }: { data: PlantRecommendationResult }) {
  return (
    <RecommendationResults
      patternSummary={data.pattern_summary}
      label="From the herbarium"
      items={data.recommendations.map((rec) => ({
        title: rec.name,
        subtitle: rec.scientific_name,
        body: rec.reason,
      }))}
    />
  );
}

function RecommendationResults({
  patternSummary,
  label,
  items,
}: {
  patternSummary: string;
  label: string;
  items: { title: string; subtitle: string; body: string }[];
}) {
  return (
    <div className="mt-6">
      {patternSummary && (
        <figure className="border-l-2 border-brass pl-5">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-sage">{label}</p>
          <blockquote className="mt-2 max-w-2xl font-display text-xl leading-relaxed italic text-foreground">
            {patternSummary}
          </blockquote>
        </figure>
      )}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li
            key={`${item.subtitle}-${item.title}-${i}`}
            className="relative border-2 border-brass/70 bg-card p-1 shadow-[0_1px_0_0_rgba(43,38,32,0.06)]"
          >
            <article className="flex h-full flex-col border border-brass/40 px-5 py-6 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sage">
                No. {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.24em] text-amber">
                {item.subtitle}
              </p>
              <div className="mx-auto my-4 h-px w-10 bg-brass/70" aria-hidden />
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
