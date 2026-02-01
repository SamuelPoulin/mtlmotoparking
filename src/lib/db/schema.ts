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
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  rpa_code: text(),
  rpa_description: text(),
  rep_description: text(),
  rac_description: text(),
  cat_description: text(),
  post_id: text(),
  post_version: text(),
  post_conception_date: text(),
  sign_id: text(),
  sign_rpa_id: text(),
  borough: text(),
  ...timestamps,
});

export type APIParking = {
  _id: string;
  Latitude: string;
  Longitude: string;
  CODE_RPA: string;
  DESCRIPTION_RPA: string;
  DESCRIPTION_REP: string;
  DESCRIPTION_RAC: string;
  DESCRIPTION_CAT: string;
  POTEAU_ID_POT: string;
  POTEAU_VERSION_POT: string;
  DATE_CONCEPTION_POT: string;
  PANNEAU_ID_PAN: string;
  PANNEAU_ID_RPA: string;
  NOM_ARROND: string;
};

export type Parking = typeof parkings.$inferSelect;
