import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listFragrances } from "@/lib/fragrances";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";
import { RecommendationPanel } from "@/components/RecommendationPanel";

export const Route = createFileRoute("/_authenticated/library/")({
  head: () => ({
    meta: [
      { title: "My Library — Top Notes" },
      { name: "description", content: "Every fragrance you've logged, with brand and your rating." },
      { property: "og:title", content: "My Library — Top Notes" },
      {
        property: "og:description",
        content: "Every fragrance you've logged, with brand and your rating.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fragrances"],
    queryFn: listFragrances,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading your library…</p>;

  if (error)
    return (
      <p className="text-sm text-destructive">
        Couldn't load your fragrances: {(error as Error).message}
      </p>
    );

  if (!data || data.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <h1 className="font-display text-2xl text-foreground">Welcome to your library</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          It's empty for now. Log the first fragrance you've tried — name, brand, what you paid, and
          what you thought — and your archive starts here.
        </p>
        <Button asChild className="mt-5">
          <Link to="/library/new">Add a fragrance</Link>
        </Button>
      </div>
    );

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-foreground">
        My library
        <span className="ml-2 align-middle text-sm font-sans text-muted-foreground">
          {data.length} {data.length === 1 ? "entry" : "entries"}
        </span>
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((f) => (
          <Link key={f.id} to="/library/$id" params={{ id: f.id }} className="block">
            <Card className="h-full gap-2 p-5 transition-colors hover:border-foreground/30">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-sage">{f.brand}</p>
              <h2 className="font-display text-xl leading-tight text-foreground">{f.name}</h2>
              <RatingStars value={f.my_rating} />
            </Card>
          </Link>
        ))}
      </div>

      <RecommendationPanel />
    </div>
  );
}
