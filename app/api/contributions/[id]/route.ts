import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { deleteCloudinaryImages } from "@/src/lib/api/cloudinary";
import { db } from "@/src/lib/db/drizzle";
import { parking_spot_contributions } from "@/src/lib/db/schema";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session?.user?.role === "admin";

  const { id } = await params;
  const contributionId = Number(id);

  if (isNaN(contributionId)) {
    return NextResponse.json(
      { error: "Invalid contribution ID" },
      { status: 400 },
    );
  }

  try {
    const [contribution] = await db
      .select()
      .from(parking_spot_contributions)
      .where(eq(parking_spot_contributions.id, contributionId))
      .limit(1);

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 },
      );
    }

    const isOwner = contribution.user_id === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteCloudinaryImages([contribution.cloudinary_public_id]);

    await db
      .delete(parking_spot_contributions)
      .where(eq(parking_spot_contributions.id, contributionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 },
    );
  }
}
