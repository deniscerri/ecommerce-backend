CREATE TABLE "orders" (
  "order_id" serial primary key,
  "user_id" int,
  "address_id" int,
  "order_date" date,
  "shipping_date" date,
  "status" varchar(10),
  constraint fk_user
  foreign key(user_id)
	references users(user_id),
  constraint fk_address
  foreign key(address_id)
	references addresses(address_id)
);