"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAPIClient } from "@/hooks/api-client";
import type { Collection } from "@/lib/types/nft";
import { useAuthSession } from "@/providers/auth-session-provider";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  image: z
    .string()
    .url("Valid image URL is required")
    .optional()
    .or(z.literal("")),
  banner: z
    .string()
    .url("Valid banner URL is required")
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export function CollectionManager() {
  const { session } = useAuthSession();
  const client = useAPIClient();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      isPublic: true,
    },
  });

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.get("/collections");
      setCollections(response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to fetch collections");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (session) {
      fetchCollections();
    }
  }, [session, fetchCollections]);

  const onSubmit = async (data: CollectionFormData) => {
    if (!session) return;

    try {
      setIsCreating(true);

      const _response = await client.post("/collections", {
        ...data,
        image: data.image || undefined,
        banner: data.banner || undefined,
      });

      toast.success("Collection created successfully!");
      reset();
      fetchCollections(); // Refresh the list
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading collections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create Collection</TabsTrigger>
        <TabsTrigger value="manage">My Collections</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter collection name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your collection"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Collection Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  {...register("image")}
                  placeholder="https://example.com/collection-image.jpg"
                />
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Banner Image URL</Label>
                <Input
                  id="banner"
                  type="url"
                  {...register("banner")}
                  placeholder="https://example.com/banner-image.jpg"
                />
                {errors.banner && (
                  <p className="text-sm text-red-600">
                    {errors.banner.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...register("isPublic")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic">Make collection public</Label>
              </div>

              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? "Creating Collection..." : "Create Collection"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="mt-6">
        {collections.length === 0 ? (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first collection to organize your NFTs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">
                    {collection.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mb-2 break-all">ID: {collection.id}</p>
                  {collection.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex gap-2 mb-4">
                    <Badge
                      variant={collection.isPublic ? "default" : "secondary"}
                    >
                      {collection.isPublic ? "Public" : "Private"}
                    </Badge>
                    <Badge variant="outline">
                      {collection.nfts?.length || 0} NFTs
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View NFTs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
