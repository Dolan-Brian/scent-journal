import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteFragrance, getFragrance } from "@/lib/fragrances";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/library/$id/")({
  head: () => ({
    meta: [
      { title: "Fragrance Details — Scent Log" },
      { name: "description", content: "Full details for one logged fragrance." },
      { property: "og:title", content: "Fragrance Details — Scent Log" },
      { property: "og:description", content: "Full details for one logged fragrance." },
    ],
  }),
  component: FragranceDetailPage,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function FragranceDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["fragrances", id],
    queryFn: () => getFragrance(id),
  });

  const remove = useMutation({
    mutationFn: () => deleteFragrance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fragrances"] });
      toast.success("Entry deleted");
      navigate({ to: "/library", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error || !data)
    return <p className="text-sm text-destructive">Couldn't load this entry.</p>;

  return (
    <article className="max-w-2xl">
      <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to library
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">{data.brand}</p>
      <h1 className="font-serif text-3xl tracking-tight text-foreground">{data.name}</h1>
      <div className="mt-3">
        <RatingStars value={data.my_rating} />
      </div>

      <dl className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          label="Price paid"
          value={data.price_paid == null ? "—" : `$${data.price_paid}`}
        />
        <Field label="Where purchased" value={data.where_purchased ?? "—"} />
        <Field label="Date tried" value={data.date_sampled ?? "—"} />
        <Field
          label="Fragrantica average"
          value={data.fragrantica_rating == null ? "—" : String(data.fragrantica_rating)}
        />
      </dl>

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">My notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {data.notes ?? "—"}
        </p>
      </div>

      <div className="mt-10 flex gap-2 border-t border-border pt-6">
        <Button asChild variant="secondary">
          <Link to="/library/$id/edit" params={{ id }}>
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                {data.name} by {data.brand} will be removed permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
