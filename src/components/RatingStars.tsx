import { Star } from "lucide-react";

export function RatingStars({ value }: { value: number | null }) {
  if (value == null) return <p className="text-xs text-muted-foreground">Not rated</p>;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= value ? "size-4 fill-accent-foreground text-accent-foreground" : "size-4 text-border"
          }
        />
      ))}
    </div>
  );
}
