import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import {
  createContribution,
  getContributionWithUser,
  getContributionsForParking,
  getUserContributionCountForParkingToday,
} from "@/src/lib/api/contributions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parkingId = searchParams.get("parking_id");

  if (!parkingId) {
    return NextResponse.json(
      { error: "Missing parking_id parameter" },
      { status: 400 },
    );
  }

  const contributions = await getContributionsForParking(Number(parkingId));

  return NextResponse.json({ contributions });
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
    const {
      parking_id,
      cloudinary_public_id,
      cloudinary_url,
      fullness,
      description,
    } = body;

    if (
      !parking_id ||
      !cloudinary_public_id ||
      !cloudinary_url ||
      fullness === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingCount = await getUserContributionCountForParkingToday(
      session.user.id,
      Number(parking_id),
    );

    if (existingCount >= 1) {
      return NextResponse.json(
        {
          error:
            "You can only submit one contribution per parking spot per day",
        },
        { status: 429 },
      );
    }

    const contribution = await createContribution({
      parking_id: Number(parking_id),
      user_id: session.user.id,
      cloudinary_public_id,
      cloudinary_url,
      fullness: Number(fullness),
      description: description || null,
    });

    const contributionWithUser = await getContributionWithUser(contribution.id);

    return NextResponse.json(
      { contribution: contributionWithUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 },
    );
  }
}
