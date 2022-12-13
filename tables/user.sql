CREATE TABLE "users" (
  "user_id" serial primary key,
  "name" varchar(30) NOT NULL,
  "surname" varchar(30) NOT NULL,
  "email" varchar(30) NOT NULL,
  "password" varchar(100) NOT NULL,
  "gender" boolean,
  "birthday" date
);