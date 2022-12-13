CREATE TABLE "addresses" (
  "address_id" serial primary key,
  "address_name" varchar(30) not null,
  "address_surname" varchar(30) not null,
  "address_email" varchar(30) not null,
  "address_country" varchar(30) not null,
  "address_city" varchar(30),
  "address_line1" varchar(100) not null,
  "address_line2" varchar(1000),
  "address_phone" varchar(15) not null
);