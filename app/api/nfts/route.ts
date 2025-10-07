import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth/middleware";
import { createNFT, getNFTsByOwner } from "@/lib/db/user";

const createNFTSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().url("Valid image URL is required"),
  metadata: z.record(z.string(), z.unknown()),
  // Allow undefined or an empty string, we'll normalize to undefined below
  collectionId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (typeof val === "string" && val.trim().length === 0 ? undefined : val)),
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nfts = await getNFTsByOwner(user.userId);
    return NextResponse.json({ nfts });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
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
    const { name, description, image, metadata, collectionId } =
      createNFTSchema.parse(body);

    const nft = await createNFT({
      name,
      description,
      image,
      metadata,
      ownerId: user.userId,
      collectionId,
    });

    return NextResponse.json({ nft }, { status: 201 });
  } catch (error) {
    console.error("Error creating NFT:", error);

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
