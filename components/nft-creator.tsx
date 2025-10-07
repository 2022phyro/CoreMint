"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAPIClient } from "@/hooks/api-client";
import type { Collection } from "@/lib/types/nft";
import { useAuthSession } from "@/providers/auth-session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const nftSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  image: z.string().url("Valid image URL is required"),
  collectionId: z.string().optional(),
});

type NFTFormData = z.infer<typeof nftSchema>;

export function NFTCreator() {
  const { session } = useAuthSession();
  const client = useAPIClient();
  const [isCreating, setIsCreating] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<
    Record<string, unknown>
  >({});
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NFTFormData>({
    resolver: zodResolver(nftSchema),
  });
  // Fetch user's collections for the dropdown
  useEffect(() => {
    async function loadCollections() {
      if (!session) return;
      try {
        setIsLoadingCollections(true);
        setCollectionsError(null);
        const response = await client.get("/collections");
        setCollections(response.data.collections ?? []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollectionsError("Failed to load collections");
      } finally {
        setIsLoadingCollections(false);
      }
    }
    loadCollections();
  }, [client, session]);

  const filteredCollections = useMemo(() => {
    const term = collectionSearch.trim().toLowerCase();
    if (!term) return collections;
    return collections.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false) ||
        c.id.toLowerCase().includes(term)
      );
    });
  }, [collectionSearch, collections]);


  const watchedFields = watch();

  const onSubmit = async (data: NFTFormData) => {
    if (!session) return;

    try {
      setIsCreating(true);

      // Create metadata object
      const metadata = {
        name: data.name,
        description: data.description || "",
        image: data.image,
        attributes: [],
        external_url: "",
        background_color: "",
        animation_url: "",
        youtube_url: "",
      };

      const payload = {
        ...data,
        // Normalize empty collectionId to undefined so it is omitted
        collectionId:
          typeof data.collectionId === "string" && data.collectionId.trim() === ""
            ? undefined
            : data.collectionId,
        metadata,
      };
      const _response = await client.post("/nfts", payload);

      toast.success("NFT created successfully!");
      reset();
      setPreviewMetadata({});
      setSelectedCollectionId("");
      setCollectionSearch("");
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error("Failed to create NFT");
    } finally {
      setIsCreating(false);
    }
  };

  const updatePreview = () => {
    if (
      watchedFields.name ||
      watchedFields.description ||
      watchedFields.image
    ) {
      setPreviewMetadata({
        name: watchedFields.name || "Untitled NFT",
        description: watchedFields.description || "No description",
        image: watchedFields.image || "",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* NFT Creation Form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter NFT name"
              onChange={(e) => {
                register("name").onChange(e);
                updatePreview();
              }}
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
              placeholder="Describe your NFT"
              rows={3}
              onChange={(e) => {
                register("description").onChange(e);
                updatePreview();
              }}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL *</Label>
            <Input
              id="image"
              type="url"
              {...register("image")}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => {
                register("image").onChange(e);
                updatePreview();
              }}
            />
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectionId">Collection (Optional)</Label>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" type="button" className="w-full justify-between">
                    {selectedCollectionId
                      ? (() => {
                          const col = collections.find((c) => c.id === selectedCollectionId);
                          return (
                            <span className="flex items-center gap-2 truncate">
                              {col?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={col.image} alt={col.name} className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <span className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
                              )}
                              <span className="truncate">{col?.name ?? selectedCollectionId}</span>
                            </span>
                          );
                        })()
                      : "Select a collection (optional)"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel>Choose Collection</DropdownMenuLabel>
                  <div className="px-2 pb-2">
                    <Input
                      placeholder="Search by name or ID"
                      value={collectionSearch}
                      onChange={(e) => setCollectionSearch(e.target.value)}
                    />
                  </div>
                  {isLoadingCollections ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
                  ) : collectionsError ? (
                    <div className="px-3 py-2 text-sm text-red-600">{collectionsError}</div>
                  ) : filteredCollections.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No collections found</div>
                  ) : (
                    filteredCollections.map((collection) => (
                      <DropdownMenuItem
                        key={collection.id}
                        onSelect={(ev) => {
                          ev.preventDefault();
                          setSelectedCollectionId(collection.id);
                          setValue("collectionId", collection.id);
                        }}
                        className="gap-2"
                      >
                        {collection.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{collection.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{collection.id}</div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(ev) => {
                      ev.preventDefault();
                      setSelectedCollectionId("");
                      setValue("collectionId", "");
                    }}
                    className="text-red-600"
                  >
                    Clear selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.collectionId && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.collectionId.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating NFT..." : "Create NFT"}
          </Button>
        </form>
      </div>

      {/* NFT Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <Card className="max-w-sm mx-auto">
          <CardHeader className="pb-3">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {previewMetadata.image ? (
                <img
                  src={previewMetadata.image as string}
                  alt={previewMetadata.name as string}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-lg">
              {(previewMetadata.name as string) || "Untitled NFT"}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(previewMetadata.description as string) || "No description"}
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">Draft</Badge>
              <Badge variant="outline">Not Minted</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
