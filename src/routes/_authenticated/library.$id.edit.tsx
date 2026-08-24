import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFragrance, updateFragrance, type FragranceInput } from "@/lib/fragrances";
import { FragranceForm } from "@/components/FragranceForm";

export const Route = createFileRoute("/_authenticated/library/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Fragrance — Scent Log" },
      { name: "description", content: "Update the details of a logged fragrance." },
      { property: "og:title", content: "Edit Fragrance — Scent Log" },
      { property: "og:description", content: "Update the details of a logged fragrance." },
    ],
  }),
  component: EditFragrancePage,
});

function EditFragrancePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fragrances", id],
    queryFn: () => getFragrance(id),
  });

  const mutation = useMutation({
    mutationFn: (input: FragranceInput) => updateFragrance(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fragrances"] });
      toast.success("Changes saved");
      navigate({ to: "/library/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl tracking-tight text-foreground">Edit entry</h1>
      <div className="mt-6">
        <FragranceForm
          initial={{
            name: data.name,
            brand: data.brand,
            price_paid: data.price_paid,
            where_purchased: data.where_purchased,
            date_sampled: data.date_sampled,
            my_rating: data.my_rating,
            notes: data.notes,
            fragrantica_rating: data.fragrantica_rating,
          }}
          submitLabel="Save changes"
          pending={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
          onCancel={() => navigate({ to: "/library/$id", params: { id } })}
        />
      </div>
    </div>
  );
}
