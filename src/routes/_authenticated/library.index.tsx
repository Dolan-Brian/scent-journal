import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listFragrances } from "@/lib/fragrances";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";

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
        <h1 className="font-serif text-xl text-foreground">Nothing logged yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first fragrance to start the archive.
        </p>
        <Button asChild className="mt-5">
          <Link to="/library/new">Add fragrance</Link>
        </Button>
      </div>
    );

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-foreground">
        My library
        <span className="ml-2 align-middle text-sm font-sans text-muted-foreground">
          {data.length} {data.length === 1 ? "entry" : "entries"}
        </span>
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((f) => (
          <Link key={f.id} to="/library/$id" params={{ id: f.id }} className="block">
            <Card className="h-full gap-2 p-5 transition-colors hover:border-foreground/30">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{f.brand}</p>
              <h2 className="font-serif text-lg leading-tight text-foreground">{f.name}</h2>
              <RatingStars value={f.my_rating} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
