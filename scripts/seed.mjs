// Seed the merch catalog. Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

const catalog = [
  {
    slug: "stab-logo-tee",
    title: "Logo Tee",
    type: "apparel",
    price_cents: 50000,
    description: "Heavyweight cotton. Front print.",
    sort_order: 0,
    variants: [
      ["S", 'W18" × L26"'],
      ["M", 'W20" × L27"'],
      ["L", 'W22" × L28"'],
      ["XL", 'W24" × L29"'],
      ["XXL", 'W26" × L30"'],
    ].map(([label, dimensions], i) => ({
      label,
      sku: `TEE-LOGO-${label}`,
      dimensions,
      stock: 25,
      sort_order: i,
    })),
  },
  {
    slug: "stab-hoodie",
    title: "Hoodie",
    type: "apparel",
    price_cents: 150000,
    description: "Pullover hoodie, back print.",
    sort_order: 1,
    variants: [
      ["S", 'W21" × L26"'],
      ["M", 'W23" × L27"'],
      ["L", 'W25" × L28"'],
      ["XL", 'W27" × L29"'],
    ].map(([label, dimensions], i) => ({
      label,
      sku: `HOOD-${label}`,
      dimensions,
      stock: 12,
      sort_order: i,
    })),
  },
  {
    slug: "stab-cap",
    title: "Cap",
    type: "accessory",
    price_cents: 50000,
    sort_order: 2,
    variants: [{ label: "OS", sku: "CAP-OS", stock: 30, sort_order: 0 }],
  },
  {
    slug: "stab-patch",
    title: "Patch",
    type: "accessory",
    price_cents: 15000,
    sort_order: 3,
    variants: [{ label: "OS", sku: "PATCH-OS", stock: 100, sort_order: 0 }],
  },
  {
    slug: "stab-lp",
    title: "LP",
    type: "music",
    price_cents: 150000,
    description: '12" vinyl.',
    sort_order: 4,
    variants: [
      { label: "Black", sku: "LP-BLK", stock: 150, sort_order: 0 },
      { label: "Blood Red", sku: "LP-RED", stock: 50, sort_order: 1 },
    ],
  },
  {
    slug: "stab-cassette",
    title: "Cassette",
    type: "music",
    price_cents: 40000,
    sort_order: 5,
    variants: [{ label: "OS", sku: "TAPE-OS", stock: 40, sort_order: 0 }],
  },
  {
    slug: "stab-cd",
    title: "CD",
    type: "music",
    price_cents: 50000,
    sort_order: 6,
    variants: [{ label: "OS", sku: "CD-OS", stock: 75, sort_order: 0 }],
  },
];

for (const { variants, ...product } of catalog) {
  const { data, error } = await supabase
    .from("products")
    .upsert(product, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) {
    console.error(`✗ ${product.slug}: ${error.message}`);
    process.exit(1);
  }

  // Replace variants wholesale so re-seeding doesn't duplicate rows.
  await supabase.from("variants").delete().eq("product_id", data.id);
  const { error: vErr } = await supabase
    .from("variants")
    .insert(variants.map((v) => ({ ...v, product_id: data.id })));
  if (vErr) {
    console.error(`✗ ${product.slug} variants: ${vErr.message}`);
    process.exit(1);
  }
  console.log(`✓ ${product.title}`);
}

console.log("\nDone: catalog seeded.");
