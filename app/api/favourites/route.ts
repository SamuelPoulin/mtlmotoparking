import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import {
  createFavourite,
  getUserFavouriteCount,
  getUserFavouriteForParking,
  getUserFavourites,
} from "@/src/lib/api/favourites";

const MAX_FAVOURITES = 5;

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favourites = await getUserFavourites(session.user.id);

    return NextResponse.json({ favourites });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourites" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { parking_id } = body;

    if (!parking_id) {
      return NextResponse.json(
        { error: "Missing parking_id" },
        { status: 400 },
      );
    }

    const parkingId = Number(parking_id);
    if (Number.isNaN(parkingId)) {
      return NextResponse.json(
        { error: "Invalid parking_id" },
        { status: 400 },
      );
    }

    const existingFavourite = await getUserFavouriteForParking(
      session.user.id,
      parkingId,
    );

    if (!existingFavourite) {
      const count = await getUserFavouriteCount(session.user.id);

      if (count >= MAX_FAVOURITES) {
        return NextResponse.json(
          { error: "Favourite limit reached", code: "limit_reached" },
          { status: 400 },
        );
      }

      await createFavourite({
        user_id: session.user.id,
        parking_id: parkingId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating favourite:", error);
    return NextResponse.json(
      { error: "Failed to create favourite" },
      { status: 500 },
    );
  }
}
