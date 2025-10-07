import { PrismaClient } from "@prisma/client";
import type { ClientSessionUser } from "@/providers/auth-session-provider";

const prisma = new PrismaClient();

export async function findUserByWalletAddress(walletAddress: string) {
  return await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      nfts: true,
      collections: true,
    },
  });
}

export async function createUser(
  walletAddress: string,
): Promise<ClientSessionUser> {
  const user = await prisma.user.create({
    data: {
      walletAddress,
      connectionHistory: [],
    },
  });

  return {
    id: user.id,
    walletAddress: user.walletAddress,
  };
}

export async function updateUserLogin(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      loginCount: {
        increment: 1,
      },
    },
  });
}

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function addConnectionHistory(
  userId: string,
  connectionData: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const history = Array.isArray(user.connectionHistory)
    ? user.connectionHistory
    : [];

  const updatedHistory = [
    ...history,
    {
      ...connectionData,
      timestamp: new Date().toISOString(),
    },
  ].slice(-10); // Keep only last 10 connections

  return await prisma.user.update({
    where: { id: userId },
    data: {
      connectionHistory: updatedHistory,
    },
  });
}

// NFT Functions
export async function createNFT(data: {
  name: string;
  description?: string;
  image: string;
  metadata: Record<string, unknown>;
  ownerId: string;
  collectionId?: string;
}) {
  return await prisma.nFT.create({
    data: {
      ...data,
      metadata: data.metadata as any, // Prisma will handle the JSON conversion
    },
    include: {
      owner: true,
      collection: true,
    },
  });
}

export async function getNFTsByOwner(ownerId: string) {
  return await prisma.nFT.findMany({
    where: { ownerId },
    include: {
      collection: true,
      transactions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNFTById(id: string) {
  return await prisma.nFT.findUnique({
    where: { id },
    include: {
      owner: true,
      collection: true,
      transactions: true,
    },
  });
}

export async function updateNFTMintStatus(
  id: string,
  tokenId: string,
  contractAddress: string,
) {
  return await prisma.nFT.update({
    where: { id },
    data: {
      isMinted: true,
      tokenId,
      contractAddress,
      mintedAt: new Date(),
    },
  });
}

// Collection Functions
export async function createCollection(data: {
  name: string;
  description?: string;
  image?: string;
  banner?: string;
  isPublic?: boolean;
  ownerId: string;
}) {
  return await prisma.collection.create({
    data,
    include: {
      owner: true,
      nfts: true,
    },
  });
}

export async function getCollectionsByOwner(ownerId: string) {
  return await prisma.collection.findMany({
    where: { ownerId },
    include: {
      nfts: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicCollections() {
  return await prisma.collection.findMany({
    where: { isPublic: true },
    include: {
      owner: true,
      nfts: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Transaction Functions
export async function createTransaction(data: {
  txHash: string;
  type: string;
  status: string;
  userId: string;
  nftId?: string;
  blockHeight?: number;
}) {
  return await prisma.transaction.create({
    data,
    include: {
      user: true,
      nft: true,
    },
  });
}

export async function updateTransactionStatus(
  txHash: string,
  status: string,
  blockHeight?: number,
) {
  return await prisma.transaction.update({
    where: { txHash },
    data: {
      status,
      blockHeight,
      updatedAt: new Date(),
    },
  });
}
