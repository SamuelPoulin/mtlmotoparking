import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/src/lib/auth";
import { deleteCloudinaryImages } from "@/src/lib/api/cloudinary";
import { db } from "@/src/lib/db/drizzle";
import { parking_spot_contributions } from "@/src/lib/db/schema";

export async function DELETE(request: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: request.headers,
  });

  if (!sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contributions = await db
      .select({ publicId: parking_spot_contributions.cloudinary_public_id })
      .from(parking_spot_contributions)
      .where(eq(parking_spot_contributions.user_id, sessionData.user.id));

    const publicIds = contributions.map((c) => c.publicId);

    if (publicIds.length > 0) {
      await deleteCloudinaryImages(publicIds);
    }

    await db
      .delete(parking_spot_contributions)
      .where(eq(parking_spot_contributions.user_id, sessionData.user.id));

    await auth.api.deleteUser({
      body: {},
      headers: request.headers,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
