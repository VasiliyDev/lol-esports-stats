-- -------------------------------------------------------------
-- TablePlus 6.3.2(586)
--
-- https://tableplus.com/
--
-- Database: myapp
-- Generation Time: 2025-03-10 20:53:24.7690
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."categories";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS champion_info_id_seq;

-- Table Definition
CREATE TABLE "public"."categories" (
    "id" int4 NOT NULL DEFAULT nextval('champion_info_id_seq'::regclass),
    "name" varchar,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."champions";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS champions_id_seq;

-- Table Definition
CREATE TABLE "public"."champions" (
    "id" int4 NOT NULL DEFAULT nextval('champions_id_seq'::regclass),
    "name" varchar(255) DEFAULT ''::character varying,
    "role" int4 NOT NULL,
    "image" varchar(255) DEFAULT ''::character varying,
    "category" int4,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."events";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS events_id_seq;

-- Table Definition
CREATE TABLE "public"."events" (
    "id" int4 NOT NULL DEFAULT nextval('events_id_seq'::regclass),
    "parsed" bool DEFAULT false,
    "parsed_at" timestamptz,
    "link" varchar(255) DEFAULT NULL::character varying,
    "name" varchar(255) DEFAULT NULL::character varying,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."game_in_selection";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS game_in_selection_id_seq;

-- Table Definition
CREATE TABLE "public"."game_in_selection" (
    "id" int4 NOT NULL DEFAULT nextval('game_in_selection_id_seq'::regclass),
    "gameId" int4,
    "selectionId" int4,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."game_selection";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS game_selection_id_seq;

-- Table Definition
CREATE TABLE "public"."game_selection" (
    "id" int4 NOT NULL DEFAULT nextval('game_selection_id_seq'::regclass),
    "name" varchar,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."games";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS games_id_seq;

-- Table Definition
CREATE TABLE "public"."games" (
    "id" int4 NOT NULL DEFAULT nextval('games_id_seq'::regclass),
    "event" int4,
    "pick1" int4 NOT NULL,
    "pick2" int4 NOT NULL,
    "pick3" int4 NOT NULL,
    "pick4" int4 NOT NULL,
    "pick5" int4 NOT NULL,
    "pick6" int4 NOT NULL,
    "pick7" int4 NOT NULL,
    "pick8" int4 NOT NULL,
    "pick9" int4 NOT NULL,
    "pick10" int4 NOT NULL,
    "link" varchar(255) DEFAULT ''::character varying,
    "winner" bool NOT NULL,
    "team1" varchar(255) DEFAULT ''::character varying,
    "team2" varchar(255) DEFAULT ''::character varying,
    PRIMARY KEY ("id")
);



-- Indices
CREATE UNIQUE INDEX champion_info_pkey ON public.categories USING btree (id);
ALTER TABLE "public"."champions" ADD FOREIGN KEY ("category") REFERENCES "public"."categories"("id");
ALTER TABLE "public"."game_in_selection" ADD FOREIGN KEY ("selectionId") REFERENCES "public"."game_selection"("id");
ALTER TABLE "public"."game_in_selection" ADD FOREIGN KEY ("gameId") REFERENCES "public"."games"("id");
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick3") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick7") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick8") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick9") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick5") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick10") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick2") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick4") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("event") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick1") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."games" ADD FOREIGN KEY ("pick6") REFERENCES "public"."champions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
