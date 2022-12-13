CREATE TABLE "products" (
  "order_id" serial primary key,
  "product_name" varchar(100) not null,
  "product_description" varchar(1000) not null,
  "product_price" money not null,
  "product_discounted_price" money,
  "product_stock" int not null
);