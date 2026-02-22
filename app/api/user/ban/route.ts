import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { deleteCloudinaryImages } from "@/src/lib/api/cloudinary";
import { db } from "@/src/lib/db/drizzle";
import { parking_spot_contributions } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user?.role === "admin";

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let targetUserId: string;

  try {
    const body = await request.json();
    targetUserId = body.userId;
  } catch {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const contributions = await db
      .select({ publicId: parking_spot_contributions.cloudinary_public_id })
      .from(parking_spot_contributions)
      .where(eq(parking_spot_contributions.user_id, targetUserId));

    const publicIds = contributions.map((c) => c.publicId);

    if (publicIds.length > 0) {
      await deleteCloudinaryImages(publicIds);
    }

    await db
      .delete(parking_spot_contributions)
      .where(eq(parking_spot_contributions.user_id, targetUserId));

    await auth.api.banUser({
      body: {
        userId: targetUserId,
        banReason: "contribution",
      },
      headers: request.headers,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 },
    );
  }
}