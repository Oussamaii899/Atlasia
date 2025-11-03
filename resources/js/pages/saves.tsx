import React, { useRef, useState } from "react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Filter, Search, Trash2, Folder, FolderPlus, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { router } from '@inertiajs/react';

type SavedPage = {
  id: string;
  title: string;
  url: string;
  description: string;
  savedAt: Date;
  tags: string[];
  category: string;
  collectionId?: string; 
};

type Place = {
  id: string;
  name: string;
  description: string;
  collectionId?: string;
};

type Collection = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export default function Saves({ places, collections: initialCollections, userId }: {
  places: Place[];
  collections: Collection[];
  userId: number;
}) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
const [savedPages, setSavedPages] = useState<SavedPage[]>(() =>
  places.map((place) => ({
    id: place.id,
    title: place.name,
    url: "#",
    description: place.description || "",
    savedAt: new Date(),
    tags: [],
    category: "place",
    collectionId: place.collectionId, 
  }))
);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("#3b82f6");
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const categories = Array.from(new Set(savedPages.map((page) => page.category)));
  const maxVisibleCollections = 5;
  const visibleCollections = collections.slice(0, maxVisibleCollections);
  const extraCollections = collections.slice(maxVisibleCollections);

  const filteredPages = savedPages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === "all" || page.category === activeTab;
    const matchesCollection = !selectedCollection || page.collectionId === selectedCollection;
    return matchesSearch && matchesTab && matchesCollection;
  });
const dialogButtonRef = useRef<HTMLButtonElement>(null);

const deletePage = async (id: string) => {
  try {
    await router.delete(`/saves/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setSavedPages((prev) => prev.filter((page) => page.id !== id));
      },
      onError: () => {
        alert(`Error unsaving place `);
      },
    });
  } catch (err) {
    console.log(`Error unsaving place: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};



  const assignToCollection = async (pageId: string, collectionId: string, userId: number) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const response = await fetch('/saves/assign', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          user_id: userId,
          place_id: pageId,
          collection_id: collectionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errors = Object.values(errorData.errors || {}).flat().join('\n');
        throw new Error(errors || 'Failed to assign collection');
      }

      setSavedPages((prev) =>
        prev.map((page) =>
          page.id === pageId ? { ...page, collectionId } : page
        )
      );
    } catch (err) {
      alert(`Error assigning to collection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      alert("Please enter a collection name.");
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch('/collections', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          color: newCollectionColor,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errors = Object.values(errorData.errors || {}).flat().join('\n');
        throw new Error(errors || 'Validation error');
      }
      const data: Collection = await response.json();
      setCollections((prev) => [...prev, data]);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setNewCollectionColor("#3b82f6");
      setIsCollectionDialogOpen(false);
    } catch (err) {
      console.error('Error creating collection:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to create collection'}`);
    }
  };
  const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Saves', href: '/saves' },
];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Saved Places" />
      <div className="container mx-auto py-6 max-w-6x p-5">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Saved Pages</h1>
            <p className="text-muted-foreground">Manage and organize your saved content.</p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search saved pages..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>All Pages</DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category} onClick={() => setActiveTab(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-2">
              <Button
                variant={!selectedCollection ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCollection(null)}
              >
                All Collections
              </Button>

              {collections.slice(0, 5).map((collection) => (
                <Button
                  key={collection.id}
                  variant={selectedCollection === collection.id ? "default" : "outline"}
                  size="sm"
                  style={{
                    borderColor: collection.color,
                    color: selectedCollection === collection.id ? "white" : collection.color,
                  }}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  {collection.name}
                </Button>
              ))}

              {collections.length > 5 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">More</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {collections.slice(5).map((collection) => (
                      <DropdownMenuItem
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection.id)}
                      >
                        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: collection.color }}></span>
                        {collection.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    <Plus className="h-4 w-4 mr-1" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label>Name</Label>
                    <Input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} />
                    <Label>Description</Label>
                    <Input value={newCollectionDescription} onChange={(e) => setNewCollectionDescription(e.target.value)} />
                    <Label>Color</Label>
                    <input type="color" value={newCollectionColor} onChange={(e) => setNewCollectionColor(e.target.value)} className="w-16 h-8" />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateCollection}>Add Collection</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPages.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full">No saved pages found.</p>
            )}
            {filteredPages.map((page) => {
              const collection = collections.find((c) => c.id === page.collectionId);
              return (
                <Card key={page.id} className="group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {page.title}
                      </CardTitle>
                      {collection && (
                        <Badge 
                          style={{ 
                            backgroundColor: collection.color,
                            boxShadow: `0 0 10px ${collection.color}40`
                          }} 
                          className="shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                        >
                          {collection.name}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                      {page.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary/20"></span>
                      Saved on {new Date(page.savedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center pt-4 border-t">
                    <a 
                      href={'/places/'+page.id} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-12" />
                      Visit Page
                    </a>
                    
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-secondary transition-colors duration-200"
                          >
                            <Folder className="h-4 w-4 transition-transform hover:scale-110" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {collections.map((col) => (
                            <DropdownMenuItem
                              key={col.id}
                              onClick={() => assignToCollection(page.id, col.id, userId)}
                              className="flex items-center gap-2 hover:bg-secondary/80"
                            >
                              <span 
                                className="h-3 w-3 rounded-full shrink-0 transition-transform hover:scale-110" 
                                style={{ backgroundColor: col.color }}
                              />
                              {col.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem 
                            onClick={() => { setTimeout(() => setIsCollectionDialogOpen(true), 100) }}
                            className="flex items-center gap-2 text-primary hover:bg-primary/10"
                          >
                            <FolderPlus className="h-4 w-4" />
                            Create New Collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 transition-transform hover:scale-110" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Unsave this place?</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              This action cannot be undone. The place will be removed from your saves.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                              <Button variant="outline" className="hover:bg-secondary">Cancel</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive"
                              onClick={() => deletePage(page.id)}
                              className="hover:bg-destructive/90"
                            >
                              Unsave
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
