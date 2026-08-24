import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFragrance, type FragranceInput } from "@/lib/fragrances";
import { FragranceForm } from "@/components/FragranceForm";

export const Route = createFileRoute("/_authenticated/library/new")({
  head: () => ({
    meta: [
      { title: "Add a Fragrance — Top Notes" },
      { name: "description", content: "Log a new fragrance with price, rating, and your notes." },
      { property: "og:title", content: "Add a Fragrance — Top Notes" },
      {
        property: "og:description",
        content: "Log a new fragrance with price, rating, and your notes.",
      },
    ],
  }),
  component: NewFragrancePage,
});

function NewFragrancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: FragranceInput) => createFragrance(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["fragrances"] });
      toast.success("Fragrance logged");
      navigate({ to: "/library/$id", params: { id: created.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl tracking-tight text-foreground">Add a fragrance</h1>
      <div className="mt-6">
        <FragranceForm
          submitLabel="Save entry"
          pending={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
          onCancel={() => navigate({ to: "/library" })}
        />
      </div>
    </div>
  );
}
