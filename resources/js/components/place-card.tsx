import React, { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';
import { BookCheck, Bookmark } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AspectRatio } from './ui/aspect-ratio';

export default function PlaceCard({ place,slug, savedPlaceIds, userId }) {
  const commentsCounts =
    Array.isArray(place.comments)
      ? place.comments.length +
        place.comments.reduce(
          (sum, comment) =>
            sum +
            (Array.isArray(comment.replies) ? comment.replies.length : 0),
          0
        )
      : 0;

  const [savedPlaces, setSavedPlaces] = useState(new Set(savedPlaceIds));

  useEffect(() => {
    setSavedPlaces(new Set(savedPlaceIds));
  }, [savedPlaceIds]);

  const toggleSave = (placeId: number) => {
    const currentlySaved = savedPlaces.has(placeId);

    setSavedPlaces(prev => {
      const newSet = new Set(prev);
      if (currentlySaved) {
        newSet.delete(placeId);
        toast.warning('Place unsaved');
      } else {
        newSet.add(placeId);
        toast.success('Place saved');
      }
      return newSet;
    });

    router.post(
      `/places/${placeId}/toggle-save`,
      {},
      {
        onError: () => {
          setSavedPlaces(prev => {
            const newSet = new Set(prev);
            if (currentlySaved) {
              newSet.add(placeId);
            } else {
              newSet.delete(placeId);
            }
            return newSet;
          });
          toast.error('Failed to toggle save');
        },
      }
    );
  };

  const logHistory = async (placeId: number) => {
    try {
      await axios.post('/histoire', {
        user_id: userId,
        place_id: placeId,
      });
      console.log('History recorded');
    } catch (error) {
      console.error('Failed to log history', error);
    }
  };

  const UpdateHistory = async (placeId: number) => {
    try {
      await axios.post('/histoire', {
        user_id: userId,
        place_id: placeId,
      });
      console.log('History updated');
    }
    catch (error) {
      console.error('Failed to update history', error);
    }
  }

  return (
    <Link href={`/places/${place.slug}`} className="block group">
  <Card 
    className="overflow-hidden hover:shadow-xl transition-all duration-300 relative h-full border-0 shadow-md group-hover:scale-[1.02]"
    key={place.id}
    onClick={() =>{ logHistory(place.id) ; UpdateHistory(place.id) }}

  >
    <div className="relative h-56 group overflow-hidden">
      {place.images && place.images.length > 0 ? (
        (() => {
          const [imageIndex, setImageIndex] = useState(0);
          const [hovered, setHovered] = useState(false);

          useEffect(() => {
            if (!hovered || place.images.length <= 1) return;
            const interval = setInterval(() => {
              setImageIndex((prev) => (prev + 1) % place.images.length);
            }, 2000);
            return () => clearInterval(interval);
          }, [hovered, place.images.length]);

          return (
            <div
              className="w-full h-full relative"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div className="w-full h-full relative">
                {place.images.map((img, idx) => (
                  <img
                    key={img.url}
                    src={img.url || "/placeholder.svg"}
                    alt={place.name}
                    className={`object-cover w-full h-full absolute top-0 left-0 transition-all duration-700 ${
                      idx === imageIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                    }`}
                    style={{ pointerEvents: idx === imageIndex ? 'auto' : 'none' }}
                  />
                ))}
              </div>
              
              {/* Image indicators */}
              {place.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                  {place.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        imageIndex === idx 
                          ? 'bg-white shadow-lg scale-125' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                      style={{ zIndex: 50 }}
                    />
                  ))}
                </div>
              )}
              
              {/* Category badge */}
              <Badge className="absolute top-3 left-3 backdrop-blur-sm shadow-sm border-0 font-medium z-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {place.category.nom}
              </Badge>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-5" />
            </div>
          );
        })()
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium">No image available</span>
          
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-foreground shadow-sm border-0 font-medium"
          >
            {place.category.nom}
          </Badge>
        </div>
      )}
    </div>

    {/* Save button */}
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleSave(place.id);
      }}
      className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:scale-110 z-20 rounded-full p-2 shadow-sm transition-all duration-200 border-0"
      aria-label={savedPlaces.has(place.id) ? 'Unsave place' : 'Save place'}
    >
      {savedPlaces.has(place.id) ? (
      <BookCheck className="w-5 h-5 text-primary" />
      ) : (
      <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary dark:text-gray-300" />
      )}
    </Button>

    <CardContent className="p-5 space-y-4">
      {/* Header section */}
      <div className="flex justify-between items-start gap-3">
        <Link href={`/places/${place.id}`} className="hover:underline flex-1 min-w-0">
          <h3 className="text-xl font-bold truncate leading-tight">
            {place.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-full shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-amber-500 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {place.rating}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
        {place.description}
      </p>

      {/* Footer section */}
      <div className="flex justify-between items-center pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm truncate">{place.address}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">{commentsCounts}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</Link>
  );
}
