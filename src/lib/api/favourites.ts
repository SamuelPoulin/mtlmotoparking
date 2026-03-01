import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/src/lib/db/drizzle";
import {
  locations,
  parking_favourites,
  parkings,
  type NewParkingFavourite,
} from "@/src/lib/db/schema";

export type FavouriteWithLocation = {
  parking_id: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
};

export async function getUserFavourites(
  userId: string,
): Promise<FavouriteWithLocation[]> {
  return db
    .select({
      parking_id: parking_favourites.parking_id,
      address: locations.address,
      latitude: locations.latitude,
      longitude: locations.longitude,
      createdAt: parking_favourites.createdAt,
    })
    .from(parking_favourites)
    .leftJoin(parkings, eq(parking_favourites.parking_id, parkings.id))
    .leftJoin(locations, eq(parkings.location_id, locations.id))
    .where(eq(parking_favourites.user_id, userId))
    .orderBy(desc(parking_favourites.createdAt));
}

export async function getUserFavouriteCount(
  userId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(parking_favourites)
    .where(eq(parking_favourites.user_id, userId));

  return result[0]?.count ?? 0;
}

export async function getUserFavouriteForParking(
  userId: string,
  parkingId: number,
) {
  const [result] = await db
    .select({
      parking_id: parking_favourites.parking_id,
      user_id: parking_favourites.user_id,
    })
    .from(parking_favourites)
    .where(
      and(
        eq(parking_favourites.user_id, userId),
        eq(parking_favourites.parking_id, parkingId),
      ),
    );

  return result ?? null;
}

export async function createFavourite(
  data: NewParkingFavourite,
): Promise<void> {
  await db.insert(parking_favourites).values(data).onConflictDoNothing({
    target: [parking_favourites.user_id, parking_favourites.parking_id],
  });
}

export async function deleteFavourite(
  userId: string,
  parkingId: number,
): Promise<void> {
  await db
    .delete(parking_favourites)
    .where(
      and(
        eq(parking_favourites.user_id, userId),
        eq(parking_favourites.parking_id, parkingId),
      ),
    );
}
