CREATE TABLE "products" (
  "product_id" serial primary key,
  "product_name" varchar(100) not null,
  "product_description" varchar(1000) not null,
  "product_price" money not null,
  "product_discounted_price" money,
  "product_stock" int not null,
  "product_category" varchar(30) not null,
  "created_at" date not null,
  "updated_at" date not null 
);