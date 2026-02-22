import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
};

export const parkings = pgTable(
  "parkings",
  {
    id: serial().primaryKey(),
    source_id: integer(),
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
    location_id: integer().references(() => locations.id),
    ...timestamps,
  },
  (table) => [
    unique("parkings_location_post_sign_unique").on(
      table.location_id,
      table.post_id,
      table.sign_id,
      table.sign_rpa_id,
      table.rpa_code,
    ),
  ],
);

export const locations = pgTable(
  "locations",
  {
    id: serial().primaryKey(),
    latitude: doublePrecision().notNull(),
    longitude: doublePrecision().notNull(),
    address: text(),
    ...timestamps,
  },
  (table) => [
    unique("locations_lat_lon_unique").on(table.latitude, table.longitude),
  ],
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user"), // Admins will have the "admin" role
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    impersonatedBy: text("impersonated_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const parking_spot_contributions = pgTable(
  "parking_spot_contributions",
  {
    id: serial().primaryKey(),
    parking_id: integer()
      .notNull()
      .references(() => parkings.id, { onDelete: "cascade" }),
    user_id: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cloudinary_public_id: text().notNull(),
    cloudinary_url: text().notNull(),
    fullness: integer().notNull(),
    description: text(),
    ...timestamps,
  },
  (table) => [
    index("contributions_parking_id_idx").on(table.parking_id),
    index("contributions_user_id_idx").on(table.user_id),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  contributions: many(parking_spot_contributions),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const parking_spot_contributionsRelations = relations(
  parking_spot_contributions,
  ({ one }) => ({
    parking: one(parkings, {
      fields: [parking_spot_contributions.parking_id],
      references: [parkings.id],
    }),
    user: one(user, {
      fields: [parking_spot_contributions.user_id],
      references: [user.id],
    }),
  }),
);

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

export type ParkingSpotContribution =
  typeof parking_spot_contributions.$inferSelect;
export type NewParkingSpotContribution =
  typeof parking_spot_contributions.$inferInsert;
