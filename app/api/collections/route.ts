import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth/middleware";
import {
  createCollection,
  getCollectionsByOwner,
  getPublicCollections,
} from "@/lib/db/user";

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().url("Valid image URL is required").optional(),
  banner: z.string().url("Valid banner URL is required").optional(),
  isPublic: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";

    let collections: Awaited<ReturnType<typeof getPublicCollections>> | Awaited<ReturnType<typeof getCollectionsByOwner>>;
    if (publicOnly) {
      collections = await getPublicCollections();
    } else {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      collections = await getCollectionsByOwner(user.userId);
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, banner, isPublic } =
      createCollectionSchema.parse(body);

    const collection = await createCollection({
      name,
      description,
      image,
      banner,
      isPublic,
      ownerId: user.userId,
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
