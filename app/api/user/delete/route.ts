import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";

export async function DELETE(request: NextRequest) {
  const sessionData = await auth.api.getSession({
    headers: request.headers,
  });

  if (!sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find contributions in the database
    //
    // Delete contributions from cloudinary
    //
    // Delete contributions from database
    //
    // Delete user with BetterAuth
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
