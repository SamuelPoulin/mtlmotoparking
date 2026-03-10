import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { generateSignature } from "@/src/lib/api/cloudinary";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signatureData = generateSignature(
    "community-parking-spot-picture",
    session.user.id,
  );

  return NextResponse.json(signatureData);
}
