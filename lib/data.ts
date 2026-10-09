import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/configured";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "variants", ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("slug", slug)
    .eq("active", true)
    .order("sort_order", { referencedTable: "variants", ascending: true })
    .single();
  if (error) return null;
  return data;
}
