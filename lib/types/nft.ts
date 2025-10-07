export interface NFT {
  id: string;
  name: string;
  description?: string;
  image: string;
  metadata: Record<string, unknown>;
  tokenId?: string;
  contractAddress?: string;
  isMinted: boolean;
  mintedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  collectionId?: string;
  owner?: {
    id: string;
    walletAddress: string;
    username?: string;
  };
  collection?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
  };
  transactions?: Transaction[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  banner?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner?: {
    id: string;
    walletAddress: string;
    username?: string;
  };
  nfts?: NFT[];
}

export interface Transaction {
  id: string;
  txHash: string;
  type: "mint" | "transfer" | "burn";
  status: "pending" | "confirmed" | "failed";
  blockHeight?: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  nftId?: string;
  user?: {
    id: string;
    walletAddress: string;
  };
  nft?: {
    id: string;
    name: string;
    image: string;
  };
}

export interface CreateNFTRequest {
  name: string;
  description?: string;
  image: string;
  metadata: Record<string, unknown>;
  collectionId?: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  image?: string;
  banner?: string;
  isPublic?: boolean;
}

export interface MintNFTRequest {
  nftId: string;
  contractAddress: string;
  tokenId: string;
}
