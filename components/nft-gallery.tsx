"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPIClient } from "@/hooks/api-client";
import type { NFT } from "@/lib/types/nft";
import { useAuthSession } from "@/providers/auth-session-provider";

export function NFTGallery() {
  const { session } = useAuthSession();
  const client = useAPIClient();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mintingNFT, setMintingNFT] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.get("/nfts");
      setNfts(response.data.nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to fetch NFTs");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (session) {
      fetchNFTs();
    }
  }, [session, fetchNFTs]);

  const handleMint = async (nft: NFT) => {
    if (!session) return;

    try {
      setMintingNFT(nft.id);

      // In a real implementation, this would:
      // 1. Call the Stacks smart contract to mint the NFT
      // 2. Get the transaction hash and contract address
      // 3. Update the NFT with the blockchain data

      // For now, we'll simulate the minting process
      toast.info("Minting NFT to blockchain...");

      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update NFT with mock blockchain data
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockContractAddress = `SP${Math.random().toString(36).substr(2, 40)}`;
      const mockTokenId = Math.random().toString(36).substr(2, 10);

      await client.post("/nfts/mint", {
        nftId: nft.id,
        txHash: mockTxHash,
        contractAddress: mockContractAddress,
        tokenId: mockTokenId,
      });

      toast.success("NFT minted successfully!");
      fetchNFTs(); // Refresh the list
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT");
    } finally {
      setMintingNFT(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your NFTs...
          </p>
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No NFTs yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create your first NFT to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">{nft.name}</CardTitle>
            {nft.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {nft.description}
              </p>
            )}

            <div className="flex gap-2 mb-4">
              {nft.isMinted ? (
                <Badge variant="default">Minted</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              {nft.collection && (
                <Badge variant="outline">{nft.collection.name}</Badge>
              )}
            </div>

            {nft.isMinted ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  <p>Token ID: {nft.tokenId}</p>
                  <p>Contract: {nft.contractAddress?.slice(0, 10)}...</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  View on Explorer
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleMint(nft)}
                disabled={mintingNFT === nft.id}
                className="w-full"
                size="sm"
              >
                {mintingNFT === nft.id ? "Minting..." : "Mint to Blockchain"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
