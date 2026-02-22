import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: request.headers,
  });

  if (!sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let targetUserId: string;

  try {
    const body = await request.json();
    targetUserId = body.userId ?? sessionData.user.id;
  } catch {
    targetUserId = sessionData.user.id;
  }

  if (targetUserId !== sessionData.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
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
