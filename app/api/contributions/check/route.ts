import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { getUserContributionCountForParkingRecently } from "@/src/lib/api/contributions";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ canContribute: false, reason: "unauthorized" });
  }

  const searchParams = request.nextUrl.searchParams;
  const parkingId = searchParams.get("parking_id");
  const isAdmin = session?.user?.role === "admin";

  if (!parkingId) {
    return NextResponse.json(
      { error: "Missing parking_id parameter" },
      { status: 400 },
    );
  }

  const count = await getUserContributionCountForParkingRecently(
    session.user.id,
    Number(parkingId),
  );

  let reason = null;

  if (!isAdmin && count >= 1) {
    reason = "limit_reached";
  }

  return NextResponse.json({
    canContribute: isAdmin ? true : count < 1,
    reason,
  });
}
