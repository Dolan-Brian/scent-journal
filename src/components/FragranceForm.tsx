import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyFragrance, type FragranceInput } from "@/lib/fragrances";

function numOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function textOrNull(value: string): string | null {
  return value.trim() === "" ? null : value;
}

export function FragranceForm({
  initial = emptyFragrance,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: FragranceInput;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (input: FragranceInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FragranceInput>(initial);

  function set<K extends keyof FragranceInput>(key: K, value: FragranceInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            required
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price paid</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price_paid ?? ""}
            onChange={(e) => set("price_paid", numOrNull(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="where">Where purchased</Label>
          <Input
            id="where"
            value={form.where_purchased ?? ""}
            onChange={(e) => set("where_purchased", textOrNull(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date tried</Label>
          <Input
            id="date"
            type="date"
            value={form.date_sampled ?? ""}
            onChange={(e) => set("date_sampled", textOrNull(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">My rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="1"
            value={form.my_rating ?? ""}
            onChange={(e) => set("my_rating", numOrNull(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fragrantica">Fragrantica average</Label>
          <Input
            id="fragrantica"
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={form.fragrantica_rating ?? ""}
            onChange={(e) => set("fragrantica_rating", numOrNull(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">My notes</Label>
        <Textarea
          id="notes"
          rows={6}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", textOrNull(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
