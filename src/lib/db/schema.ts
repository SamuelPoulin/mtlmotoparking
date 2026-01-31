import { sql } from "drizzle-orm";
import { doublePrecision, integer, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
};

export const parkings = pgTable("parkings", {
  id: integer().primaryKey(),
  latitude: doublePrecision().notNull(),
  longitude: doublePrecision().notNull(),
  rpa_code: text().notNull(),
  rep_description: text().notNull(),
  post_id: integer().notNull(),
  borough: text().notNull(),
  ...timestamps,
});

export type Parking = typeof parkings.$inferSelect;
