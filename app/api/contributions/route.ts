import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import {
  createContribution,
  getContributionWithUser,
  getContributionsForParking,
  getUserContributionCountForParkingRecently,
} from "@/src/lib/api/contributions";
import { verifyContributionAssetOwnership } from "@/src/lib/api/cloudinary";
import {
  createContributionSchema,
  DESCRIPTION_MAX_LENGTH,
} from "@/src/lib/validation/contributions";



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

  const isAdmin = session?.user?.role === "admin";

  try {
    const body = await request.json();
    const parsed = createContributionSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      if (!firstIssue) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
      }

      if (firstIssue.path[0] === "description") {
        return NextResponse.json(
          {
            error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 },
      );
    }

    const {
      parking_id,
      cloudinary_public_id,
      cloudinary_url,
      fullness,
      description,
    } = parsed.data;

    const assetIsValid = await verifyContributionAssetOwnership({
      publicId: cloudinary_public_id,
      expectedOwnerUserId: session.user.id,
      expectedSecureUrl: cloudinary_url,
    });

    if (!assetIsValid) {
      return NextResponse.json(
        { error: "Uploaded asset could not be validated" },
        { status: 403 },
      );
    }

    const existingCount = await getUserContributionCountForParkingRecently(
      session.user.id,
      parking_id,
    );

    if (!isAdmin && existingCount >= 1) {
      return NextResponse.json(
        {
          error:
            "You can only submit one contribution per parking spot per day",
        },
        { status: 429 },
      );
    }

    const contribution = await createContribution({
      parking_id,
      user_id: session.user.id,
      cloudinary_public_id,
      cloudinary_url,
      fullness,
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
