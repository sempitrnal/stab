-- Per-product preorder flag. Preorder products ignore stock: they are always
-- purchasable, show a "preorder" badge, and don't decrement variant stock.
alter table products
  add column preorder boolean not null default false;
