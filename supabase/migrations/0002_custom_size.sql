-- Per-product switch for made-to-measure sizing (apparel). When on, the
-- product page shows a "Custom" size where the buyer types width and length.
alter table products
  add column allow_custom_size boolean not null default false;
