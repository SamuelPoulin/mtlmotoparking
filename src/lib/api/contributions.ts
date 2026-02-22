import { and, desc, eq, gt, sql } from "drizzle-orm";

import { db } from "@/src/lib/db/drizzle";
import {
  parking_spot_contributions,
  user,
  type NewParkingSpotContribution,
  type ParkingSpotContribution,
} from "@/src/lib/db/schema";

export type ContributionWithUser = ParkingSpotContribution & {
  user: { name: string | null; image: string | null } | null;
};

export async function getContributionsForParking(
  parkingId: number,
): Promise<ContributionWithUser[]> {
  return db
    .select({
      id: parking_spot_contributions.id,
      parking_id: parking_spot_contributions.parking_id,
      user_id: parking_spot_contributions.user_id,
      cloudinary_public_id: parking_spot_contributions.cloudinary_public_id,
      cloudinary_url: parking_spot_contributions.cloudinary_url,
      fullness: parking_spot_contributions.fullness,
      description: parking_spot_contributions.description,
      createdAt: parking_spot_contributions.createdAt,
      updatedAt: parking_spot_contributions.updatedAt,
      user: {
        name: user.name,
        image: user.image,
      },
    })
    .from(parking_spot_contributions)
    .leftJoin(user, eq(parking_spot_contributions.user_id, user.id))
    .where(eq(parking_spot_contributions.parking_id, parkingId))
    .orderBy(desc(parking_spot_contributions.createdAt));
}

export async function getUserContributionCountForParkingToday(
  userId: string,
  parkingId: number,
): Promise<number> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(parking_spot_contributions)
    .where(
      and(
        eq(parking_spot_contributions.user_id, userId),
        eq(parking_spot_contributions.parking_id, parkingId),
        gt(parking_spot_contributions.createdAt, oneDayAgo),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function getUserContributionCountForParkingRecently(
  userId: string,
  parkingId: number,
): Promise<number> {
  const hoursAgo = new Date();
  hoursAgo.setTime(hoursAgo.getTime() - 18 * 60 * 60 * 1000);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(parking_spot_contributions)
    .where(
      and(
        eq(parking_spot_contributions.user_id, userId),
        eq(parking_spot_contributions.parking_id, parkingId),
        gt(parking_spot_contributions.createdAt, hoursAgo),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function createContribution(
  data: NewParkingSpotContribution,
): Promise<ParkingSpotContribution> {
  const [contribution] = await db
    .insert(parking_spot_contributions)
    .values(data)
    .returning();

  return contribution;
}

export async function getContributionWithUser(
  contributionId: number,
): Promise<ContributionWithUser | null> {
  const [result] = await db
    .select({
      id: parking_spot_contributions.id,
      parking_id: parking_spot_contributions.parking_id,
      user_id: parking_spot_contributions.user_id,
      cloudinary_public_id: parking_spot_contributions.cloudinary_public_id,
      cloudinary_url: parking_spot_contributions.cloudinary_url,
      fullness: parking_spot_contributions.fullness,
      description: parking_spot_contributions.description,
      createdAt: parking_spot_contributions.createdAt,
      updatedAt: parking_spot_contributions.updatedAt,
      user: {
        name: user.name,
        image: user.image,
      },
    })
    .from(parking_spot_contributions)
    .leftJoin(user, eq(parking_spot_contributions.user_id, user.id))
    .where(eq(parking_spot_contributions.id, contributionId));

  return result ?? null;
}

export async function getCloudinaryPublicIdsByUser(
  userId: string,
): Promise<string[]> {
  const contributions = await db
    .select({ publicId: parking_spot_contributions.cloudinary_public_id })
    .from(parking_spot_contributions)
    .where(eq(parking_spot_contributions.user_id, userId));

  return contributions.map((c) => c.publicId);
}
