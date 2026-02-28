import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { deleteFavourite } from "@/src/lib/api/favourites";

type RouteContext = {
  params: Promise<{ parking_id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parking_id } = await context.params;
    const parkingId = Number(parking_id);

    if (Number.isNaN(parkingId)) {
      return NextResponse.json(
        { error: "Invalid parking_id" },
        { status: 400 },
      );
    }

    await deleteFavourite(session.user.id, parkingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favourite:", error);
    return NextResponse.json(
      { error: "Failed to delete favourite" },
      { status: 500 },
    );
  }
}
