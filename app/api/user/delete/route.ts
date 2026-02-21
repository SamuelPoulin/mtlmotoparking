import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { deleteCloudinaryImages } from "@/src/lib/api/cloudinary";
import { getCloudinaryPublicIdsByUser } from "@/src/lib/api/contributions";
import { db } from "@/src/lib/db/drizzle";
import { user } from "@/src/lib/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let targetUserId: string;

  try {
    const body = await request.json();
    targetUserId = body.userId ?? session.user.id;
  } catch {
    targetUserId = session.user.id;
  }

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin === true;

  if (targetUserId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const publicIds = await getCloudinaryPublicIdsByUser(targetUserId);
    await deleteCloudinaryImages(publicIds);
    await db.delete(user).where(eq(user.id, targetUserId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}