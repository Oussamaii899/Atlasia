import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BookCheck, Bookmark, ChevronLeft, ChevronRight, Copy, Eye, Mail, MapPin, Phone, Reply, Share2, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios';

declare global {
  interface Window {
    initMap: () => void;
  }
}


const loadGoogleMapsApi = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;

    promise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB49N7oj5KJPf8TZYoxehgDpEwREka_3Ak&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve(window.google.maps);
      };
      script.onerror = () => reject(new Error('Google Maps API failed to load'));

      document.head.appendChild(script);
    });
    return promise;
  };
})();



export default function Show({user, place, savedPlaceIds, userRating: initialUserRating, RCount}) {

  const [userRating, setUserRating] = useState(initialUserRating || 0);
  const [activeTab, setActiveTab] = useState('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openingHours, setOpeningHours] = useState(null);
  const [address, setAddress] = useState(null);
  const mapRef = useRef(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [expandedReplies, setExpandedReplies] = useState<number | null>(null);

const [savedPlaces, setSavedPlaces] = useState<Set<number>>(new Set(savedPlaceIds ?? []));

  const UpdateHistory = async (placeId: number) => {
    try {
      await axios.post('/histoire', {
        user_id: user.id,
        place_id: placeId,
      });
      console.log('History updated');
    }
    catch (error) {
      console.error('Failed to update history', error);
    }
  }


  useEffect(() => {
      UpdateHistory(place.id);
  });

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


 const { flash } = usePage().props;
  const fragment = flash?.fragment;

  useEffect(() => {
    if (fragment) {
      const el = document.getElementById(fragment);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('bg-gray-100');
        el.classList.add('dark:bg-gray-800');
        setTimeout(() => el.classList.remove('bg-gray-100'), 2000);
        setTimeout(() => el.classList.remove('dark:bg-gray-800'), 2000);
      }
    }
  }, [fragment]);
  
  useEffect(() => {
    if (activeTab !== 'map' || !place) return;

    loadGoogleMapsApi()
      .then((googleMaps) => {
        if (!mapRef.current) return;

        const placesArray = Array.isArray(place) ? place : [place];

        const grouped = {};
        placesArray.forEach((p) => {
          const lat = parseFloat(p.lat);
          const lng = parseFloat(p.lng);
          const key = `${lat.toFixed(7)}_${lng.toFixed(7)}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(p);
        });

        const firstPlace = placesArray[0];
        const map = new googleMaps.Map(mapRef.current, {
          zoom: 17,
          minZoom: 16,
          draggable: false,
          disableDefaultUI: true,
          streetViewControl: true,
          center: { lat: parseFloat(firstPlace.lat), lng: parseFloat(firstPlace.lng) },
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: googleMaps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: googleMaps.ControlPosition.BOTTOM_LEFT,
          },
        });

        const offsetLatLng = (lat, lng, index) => {
          const offset = 0.00005 * index;
          return {
            lat: lat + offset,
            lng: lng + offset,
          };
        };

        
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
      });
  }, [activeTab, place]);


  useEffect(() => {
    if (!place) return;

    loadGoogleMapsApi()
      .then((googleMaps) => {
        const firstPlace = Array.isArray(place) ? place[0] : place;

        const dummyMap = new googleMaps.Map(document.createElement('div'));
        const service = new googleMaps.places.PlacesService(dummyMap);

        service.findPlaceFromQuery(
          {
            query: `${firstPlace.name} ${firstPlace.city}`,
            fields: ['place_id'],
          },
          (results, status) => {
            if (
              status === googleMaps.places.PlacesServiceStatus.OK &&
              results &&
              results[0]?.place_id
            ) {
              const placeId = results[0].place_id;
              service.getDetails(
                {
                  placeId,
                  fields: ['opening_hours', 'formatted_address', 'name'],
                },
                (placeDetail, detailStatus) => {
                  if (
                    detailStatus === googleMaps.places.PlacesServiceStatus.OK &&
                    placeDetail
                  ) {
                    setOpeningHours(placeDetail.opening_hours?.weekday_text ?? null);
                    setAddress(placeDetail.formatted_address ?? null);
                  } else {
                    setOpeningHours(null);
                    setAddress(null);
                  }
                }
              );
            } else {
              setOpeningHours(null);
              setAddress(null);
            }
          }
        );
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
        setOpeningHours(null);
        setAddress(null);
      });
  }, [place]);
/* 
  console.log(openingHours);

  console.log(place); */
   const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === place.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? place.images.length - 1 : prev - 1))
  }





  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = (e.target as HTMLFormElement).content.value;
    router.post(`/places/${place.id}/comments`, {
      content: content,
    }, {
      onSuccess: () => {
        (e.target as HTMLFormElement).reset();
        toast.success('Comment posted successfully');
      },
      onError: (error) => {
        toast.error('Failed to post comment');
        console.log(content);
        console.error('Failed to post comment:', error);
      },
    });
    console.log('Comment submitted:', content);
  };

    const sharePlace = (place) => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.description,
        url: 'https://localhost/places/' + place.id,
      })
    } else {
      toast.success("Link copied to clipboard!")
    }
  }

  const handleReactionComment = (commentId: number, reaction: string) => {
      router.post(`/comments/${commentId}/${user.id}/${reaction}`, {
      reaction: reaction,
      commend_id: commentId,
      }, {
      onSuccess: () => {
        
      },
      onError: (error) => {
        console.error('Failed to react to comment:', error);
      },
    });
  };
  const handleReactionReply = (replyId: number, reaction: string) => {
      router.post(`/replies/${replyId}/${user.id}/${reaction}`, {
      reaction: reaction,
      reply_id: replyId,
      }, {
      onSuccess: () => {
        
      },
      onError: (error) => {
        console.error('Failed to react to reply:', error);
      },
    });
  };


const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
const [editedContent, setEditedContent] = useState("");
const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
const [editedContentR, setEditedContentR] = useState("");

const handleEditComment = (commentId: number, content: string) => {
  router.patch(`/commentss/${commentId}`, {
    content: content
  }, {
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedContent("");
      toast.success('Comment updated successfully');
    },
    onError: () => toast.error('Failed to update comment')
  });
};
const handleEditReply = (replyId: number, content: string) => {
  router.patch(`/repliess/${replyId}`, {
    content: content
  }, {
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedContent("");
      toast.success('Reply updated successfully');
    },
    onError: () => toast.error('Failed to update Reply')
  });
};

const handleDeleteComment = (commentId: number) => {
  router.delete(`/comments/${commentId}`, {
    onSuccess: () => toast.success('Comment deleted successfully'),
    onError: () => toast.error('Failed to delete comment')
  });
};
const handleDeleteReply = (replyId: number) => {
  router.delete(`/replies/${replyId}`, {
    onSuccess: () => toast.success('reply deleted successfully'),
    onError: () => toast.error('Failed to delete reply')
  });
};




console.log(RCount)






const [hoverRating, setHoverRating] = useState(0);
const [isSubmittingRating, setIsSubmittingRating] = useState(false);

const handleRatingSubmit = (rating) => {
  if (isSubmittingRating) return;
  
  setIsSubmittingRating(true);
  
  router.post(`/places/${place.id}/rate`, {
    rating: rating
  }, {
    onSuccess: () => {
      setUserRating(rating);
      toast.success('Rating submitted successfully');
      setIsSubmittingRating(false);
    },
    onError: (error) => {
      toast.error('Failed to submit rating');
      console.error('Failed to submit rating:', error);
      setIsSubmittingRating(false);
    },
  });
};

const handleRatingRemove = () => {
  if (isSubmittingRating) return;
  
  setIsSubmittingRating(true);
  
  router.delete(`/places/${place.id}/rating`, {
    onSuccess: () => {
      setUserRating(0);
      toast.success('Rating removed successfully');
      setIsSubmittingRating(false);
    },
    onError: (error) => {
      toast.error('Failed to remove rating');
      console.error('Failed to remove rating:', error);
      setIsSubmittingRating(false);
    },
  });
};
  console.log(place)
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
  return (
    <AppLayout >
      <Head title={place.name} />
      <Toaster position="top-right" richColors />
      <div className="absolute left-4 sm:left-8 lg:left-12 top-24 z-10">
        <Button 
          variant="outline" 
          onClick={() => router.get('/posts')}
          className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Places
        </Button>
      </div>
      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
              <div className="px-6 pt-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details" className="p-6 pt-4">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Image Gallery */}
                  <div className="w-full lg:w-2/5">
                    <div className="relative rounded-lg overflow-hidden h-72 lg:h-96 bg-black">
                      <img
                        alt={`${place.name} - Image ${currentImageIndex + 1}`}
                        src={place.images && place.images.length > 0 && place.images[0].url ? place.images[currentImageIndex].url : "/placeholder.svg"}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: "center" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full bg-white/80 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm hover:bg-white/90"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                          <span className="sr-only">Previous image</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 hover:bg-white/90"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                          <span className="sr-only">Next image</span>
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {place.images.map((_, index) => (
                          <button
                            key={index}
                            className={`h-1.5 rounded-full ${
                              index === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                       {place.images.map((image, index) => (
                        <button
                          key={index}
                          className={`rounded-md overflow-hidden h-16 ${
                            index === currentImageIndex ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))} 
                    </div>
                  </div>

                  {/* Place Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {place.category.nom}
                        </Badge>
                        <h1 className="text-3xl font-bold">{place.name}</h1>
                        <div className="mt-1 flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{place.address}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=> sharePlace(place)} className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        <Button variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleSave(place.id);
                            }} size="sm" className="flex items-center gap-1">
                          {savedPlaces.has(place.id) ? (
                            <BookCheck className="w-5 h-5 text-primary" />
                            ) : (
                            <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary dark:text-gray-300" />
                            )}
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-4 flex items-center">
                      <div className="flex items-center mr-6">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-medium">{place.rating}</span>
                        <span className="ml-1 text-muted-foreground">({RCount} reviews)</span>
                      </div>

                        <div className="flex items-center text-muted-foreground">
                          <Eye className="h-5 w-5 mr-1" />
                          <span>{place.review_count || 0} views</span>
                        </div>
                      

                      {/* Rating Input */}
                      <div className="flex items-center px-4">
                        <span className="text-sm text-muted-foreground mr-2">Rate:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`p-0.5 focus:outline-none`}
                            onClick={() => handleRatingSubmit(value)}
                            style={{ cursor: "pointer" }}
                            tabIndex={0}
                            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                          >
                            <Star
                            className={`h-5 w-5 transition-colors ${
                              userRating >= value ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                            }`}
                            onMouseEnter={() => setUserRating(value)}
                            onMouseLeave={() => setUserRating(initialUserRating || 0)}
                            />
                          </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-muted-foreground">{place.description}</p>

                    {/* Features */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
  {/*                     {place.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          <span>{feature}</span>
                        </div>
                      ))} */}
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Amenities Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {place.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span>{amenity.replace(/_/, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/50 p-6 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-medium">Phone</h3>
                          <p className="text-muted-foreground">{place.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-muted-foreground">{place.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-3 mt-0.5 text-primary"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <div>
                          <h3 className="font-medium">Website</h3>
                          <p className="text-muted-foreground">{place.website}</p>
                        </div>
                        
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-medium">Address</h3>
                          <p className="text-muted-foreground">{ address || place.address || 'No Adress Available'} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

<TabsContent value="comments" className="p-6">
  <h2 className="text-xl font-semibold mb-6">Comments ({commentsCounts})</h2>

  {/* Comment Form */}
  <div className="flex gap-4">
    <Avatar className="h-10 w-10">
      <AvatarImage src={user?.avatar || ''} alt={user?.avatar || ''} />
      <AvatarFallback />
    </Avatar>
    <div className="flex-1">
      <form onSubmit={handleCommentSubmit} className="flex flex-col">
        <Textarea id="content" name="content" rows={3} placeholder="Add a comment..." className="resize-none" />
        <div className="mt-2 flex justify-end">
          <Button type="submit">Post Comment</Button>
        </div>
      </form>
    </div>
  </div>

  {/* Comments List */}
  <div className="mt-8 space-y-8">
    {place.comments.map((comment) => (
      <div key={comment.id} id={'comment-'+comment.id} className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>

        
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium cursor-pointer hover:underline " onClick={() => router.visit(route('profile', comment.user.slug))}>{comment.user.name}</h3>
            <span className="ml-2 text-sm text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
            </span>
                      {(user?.id === comment.user_id || user?.role === 'admin') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem 
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditedContent(comment.content);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          </div>
          {/* Comment Content - Toggle between view and edit mode */}
        <div className="mt-1 text-sm">
          {editingCommentId === comment.id ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleEditComment(comment.id, editedContent);
              }}
              className="space-y-2"
            >
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditedContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p>{comment.content}</p>
          )}
        </div>
          <div className="mt-2 flex items-center space-x-4">
  <Button
    variant={'ghost'}
    size="sm"
    className="h-8 px-2 text-muted-foreground"
    onClick={() => handleReactionComment(comment.id, 'like')}
  >
    <ThumbsUp className="h-4 w-4 mr-1" />
    <span>{comment.likes}</span>
  </Button>
  {/* 
    comment.reactions?.find(r => r.user_id === user.id && r.reaction === 'like')

  */}

  <Button
    variant={'ghost'}
    size="sm"
    className="h-8 px-2 text-muted-foreground"
    onClick={() => handleReactionComment(comment.id, 'dislike')}
    >
    <ThumbsDown className="h-4 w-4 mr-1" />
    <span>{comment.dislikes}</span>
  </Button>

  <Button
    variant="ghost"
    size="sm"
    className="h-8 px-2 text-muted-foreground"
    onClick={() =>
      setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)
    }
  >
    <Reply className="h-4 w-4 mr-1" />
    Reply
  </Button>
</div>


          {/* Reply Form */}
            {replyingToCommentId === comment.id && (
            <form 
              onSubmit={(e) => {
              e.preventDefault();
              router.post(
                `/comments/${comment.id}/reply`,
                { content: replyContent },
                {
                onSuccess: () => {
                  setReplyContent('');
                  setReplyingToCommentId(null);
                  toast.success('Reply posted successfully');
                },
                onError: (error) => {
                  toast.error('Failed to post reply');
                  console.error('Failed to post reply:', error);
                },
                }
              );
              }}
              className="mt-4 space-y-2"
            >
              <Textarea
              rows={2}
              className="w-full resize-none"
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex space-x-2">
              <Button size="sm" type="submit">Send</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setReplyingToCommentId(null)}>
                Cancel
              </Button>
              </div>
            </form>
            )}

          {/* Replies */}
{comment.replies && comment.replies.length > 0 && (
  <div className="mt-2">
    <Button
      variant="ghost"
      size="sm"
      className={`px-0 h-7 text-muted-foreground font-semibold rounded focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors duration-200 hover:text-primary`}
      onClick={() => setExpandedReplies(expandedReplies === comment.id ? null : comment.id)}
      type="button"
      aria-expanded={expandedReplies === comment.id}
      aria-controls={`replies-${comment.id}`}
      style={{ background: "none", boxShadow: "none" }}
    >
      <span
      className={`mr-2 transition-transform duration-200 inline-block ${
        expandedReplies === comment.id ? "rotate-90" : ""
      }`}
      >
      <ChevronRight className="h-4 w-4" />
      </span>
      <span className="relative">
      {expandedReplies === comment.id ? "Hide" : "Show"} Replies
      </span>
      <span className="ml-2 inline-block bg-muted text-xs px-2 py-0.5 rounded-full align-middle transition-colors duration-200">
      {comment.replies.length}
      </span>
    </Button>
    {expandedReplies === comment.id && (
      <div className="mt-4 space-y-4 pl-6 border-l-2 border-muted">
        {comment.replies.map((reply) => (
          <div key={reply.id} id={'reply-'+reply.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.name} />
              <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium cursor-pointer hover:underline " onClick={() => router.visit(route('profile', reply.user.slug))}>{reply.user.name}</h4>
                <span className="ml-2 text-sm text-muted-foreground">
                  {new Date(reply.created_at).toLocaleString()}
                </span>
                {(user.id === reply.user_id || user.role === 'admin') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem 
                onClick={() => {
                  setEditingReplyId(reply.id);
                  setEditedContentR(reply.content);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteReply(reply.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
              </div>
             <div className="mt-1 text-sm">
        {editingReplyId === reply.id ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleEditReply(reply.id, editedContentR);
            }}
            className="space-y-2"
          >
            <Textarea
              value={editedContentR}
              onChange={(e) => setEditedContentR(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save</Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingReplyId(null);
                  setEditedContentR("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p>{reply.content}</p>
        )}
      </div>
              <div className="mt-2 flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" onClick={() => handleReactionReply(reply.id, 'like')}>
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span>{reply.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" onClick={() => handleReactionReply(reply.id, 'dislike')}>
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  <span>{reply.dislikes}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    ))}
  </div>
              </TabsContent>

              <TabsContent value="map" className="p-0">
                <div className="p-6">
                  <h2 className="text-xl font-semibold">Location</h2>
                  <div className="mt-2 flex items-center text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{place.address}</span>
                  </div>
                </div>
                
                <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow border" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  );
}