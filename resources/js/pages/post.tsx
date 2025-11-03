import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookCheck, Bookmark } from 'lucide-react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Posts', href: '/posts' }
];

export default function Post({ places, savedPlaceIds, userId }) {
  const [savedPlaces, setSavedPlaces] = useState<Set<number>>(new Set(savedPlaceIds));

  const[action,setAction] = useState('');

  const toggleSave = (placeId: number) => {
    try {
      router.post(
        `/places/${placeId}/toggle-save`,
        {},
        {
          onSuccess: () => {
            setSavedPlaces(prev => {
              const newSet = new Set(prev);
              if (!prev.has(placeId)) {
                newSet.add(placeId);
                toast.success('Place saved');
              } else {
                newSet.delete(placeId);
                toast.warning('Place unsaved');
              }
              return newSet;
            });
          },
          onError: () => {
            toast.error('Failed to toggle save');
            console.error('Failed to toggle save');
          },
        }
      );
    } catch(error) {
      toast.error('Something went wrong');
      console.error(error);
    }
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Post" />
      <Toaster position="top-right" richColors />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {places.map((place) => (
          <Card
            key={place.id}
            onClick={() => logHistory(place.id)}
            className="cursor-pointer"
          >
            <CardHeader>
              <CardTitle>{place.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{place.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  toggleSave(place.id);
                }}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                {savedPlaces.has(place.id) ? (
                  <BookCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
