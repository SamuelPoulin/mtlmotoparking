import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db/drizzle";
import {
  locations,
  parking_spot_contributions,
  parkings,
  user,
} from "@/src/lib/db/schema";

export type ParkingSpotContributionWithLocation = {
  id: number;
  parking_id: number;
  cloudinary_public_id: string;
  cloudinary_url: string;
  fullness: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  parking: {
    id: number | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
};

export type UserSettingsResponse = {
  navigationApp: string | null;
  contributions: ParkingSpotContributionWithLocation[];
};

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [userData] = await db
      .select({ navigationApp: user.navigationApp })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const contributions = await db
      .select({
        id: parking_spot_contributions.id,
        parking_id: parking_spot_contributions.parking_id,
        cloudinary_public_id: parking_spot_contributions.cloudinary_public_id,
        cloudinary_url: parking_spot_contributions.cloudinary_url,
        fullness: parking_spot_contributions.fullness,
        description: parking_spot_contributions.description,
        createdAt: parking_spot_contributions.createdAt,
        updatedAt: parking_spot_contributions.updatedAt,
        parking: {
          id: parkings.id,
          address: locations.address,
          latitude: locations.latitude,
          longitude: locations.longitude,
        },
      })
      .from(parking_spot_contributions)
      .leftJoin(
        parkings,
        eq(parking_spot_contributions.parking_id, parkings.id),
      )
      .leftJoin(locations, eq(parkings.location_id, locations.id))
      .where(eq(parking_spot_contributions.user_id, session.user.id))
      .orderBy(desc(parking_spot_contributions.createdAt));

    const response: UserSettingsResponse = {
      navigationApp: userData?.navigationApp ?? null,
      contributions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { navigationApp } = body;

    if (
      navigationApp !== null &&
      navigationApp !== "waze" &&
      navigationApp !== "google" &&
      navigationApp !== "apple"
    ) {
      return NextResponse.json(
        { error: "Invalid navigation app" },
        { status: 400 },
      );
    }

    await db
      .update(user)
      .set({ navigationApp })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, navigationApp });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 },
    );
  }
}
