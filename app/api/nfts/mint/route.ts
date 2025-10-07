import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth/middleware";
import {
  createTransaction,
  getNFTById,
  updateNFTMintStatus,
} from "@/lib/db/user";

const mintNFTSchema = z.object({
  nftId: z.string().min(1, "NFT ID is required"),
  txHash: z.string().min(1, "Transaction hash is required"),
  contractAddress: z.string().min(1, "Contract address is required"),
  tokenId: z.string().min(1, "Token ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nftId, txHash, contractAddress, tokenId } =
      mintNFTSchema.parse(body);

    // Verify the NFT exists and belongs to the user
    const nft = await getNFTById(nftId);
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    if (nft.ownerId !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized to mint this NFT" },
        { status: 403 },
      );
    }

    if (nft.isMinted) {
      return NextResponse.json(
        { error: "NFT is already minted" },
        { status: 400 },
      );
    }

    // Update NFT mint status
    const updatedNFT = await updateNFTMintStatus(
      nftId,
      tokenId,
      contractAddress,
    );

    // Create transaction record
    await createTransaction({
      txHash,
      type: "mint",
      status: "pending",
      userId: user.userId,
      nftId,
    });

    return NextResponse.json({ nft: updatedNFT });
  } catch (error) {
    console.error("Error minting NFT:", error);

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
