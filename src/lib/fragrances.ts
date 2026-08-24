import { supabase } from "./supabase";

/** The table in the connected Supabase project (note the capital F). */
const TABLE = "Fragrances";

export interface Fragrance {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  brand: string;
  price_paid: number | null;
  where_purchased: string | null;
  date_sampled: string | null;
  my_rating: number | null;
  notes: string | null;
  fragrantica_rating: number | null;
}

export type FragranceInput = Omit<Fragrance, "id" | "created_at" | "user_id">;

export const emptyFragrance: FragranceInput = {
  name: "",
  brand: "",
  price_paid: null,
  where_purchased: null,
  date_sampled: null,
  my_rating: null,
  notes: null,
  fragrantica_rating: null,
};

export async function listFragrances(): Promise<Fragrance[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Fragrance[];
}

export async function getFragrance(id: string): Promise<Fragrance> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data as Fragrance;
}

export async function createFragrance(input: FragranceInput): Promise<Fragrance> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as Fragrance;
}

export async function updateFragrance(id: string, input: FragranceInput): Promise<Fragrance> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Fragrance;
}

export async function deleteFragrance(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
