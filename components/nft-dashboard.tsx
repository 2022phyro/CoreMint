"use client";

import { CollectionManager } from "@/components/collection-manager";
import { NFTCreator } from "@/components/nft-creator";
import { NFTGallery } from "@/components/nft-gallery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnection } from "@/components/wallet-connection";
import { useAuthSession } from "@/providers/auth-session-provider";

export function NFTDashboard() {
  const { session } = useAuthSession();

  // If user is not authenticated, show wallet connection
  if (!session) {
    return <WalletConnection />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">CoreMint</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Create, mint, and manage your NFTs on Stacks blockchain
          </p>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create NFT</TabsTrigger>
            <TabsTrigger value="gallery">My NFTs</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New NFT</CardTitle>
                <CardDescription>
                  Design and prepare your NFT for minting on Stacks blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFTCreator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My NFTs</CardTitle>
                <CardDescription>
                  View and manage your created NFTs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFTGallery />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Collections</CardTitle>
                <CardDescription>
                  Organize your NFTs into collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CollectionManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
