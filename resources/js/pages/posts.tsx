import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import SearchBar from '@/components/search-bar';
import PlaceCard from '@/components/place-card';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@headlessui/react';



export default function Index({ places, savedPlaceIds, userId, search , filters }) {
    const { data, links, meta } = places;

    const { url } = usePage(); // get current URL
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const cityFromQuery = urlParams.get('city');


    //filter
      const [searchQuery, setSearchQuery] = React.useState(search || "")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(filters.categories || [])
  const [selectedCities, setSelectedCities] = React.useState<string[]>(cityFromQuery ? [cityFromQuery] : []);
  const [minRating, setMinRating] = React.useState(0)
  const [sortBy, setSortBy] = React.useState("")
  const filteredPosts = places.data.filter(post =>
    (!searchQuery || post.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategories.length === 0 || selectedCategories.includes(post.category.nom)) &&
    (selectedCities.length === 0 || selectedCities.includes(post.city)) &&
    (minRating === 0 || post.rating >= minRating)
  )

    console.log(places.data);
    console.log(places);

    const breadcrumbs: BreadcrumbItem[] = [
      {
        title: 'Places',
        href: '/posts',
      },
    ];
return (
<AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Places" />
    <Toaster position="top-right" richColors />
      
  <div className="min-h-screen bg-background transition-colors duration-200">
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      
        
        <Card className="shadow-lg">
          <CardContent className="p-8">

            <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedCities={selectedCities}
        setSelectedCities={setSelectedCities}
        minRating={minRating}
        setMinRating={setMinRating}
        sortBy={sortBy}
        setSortBy={setSortBy}
        />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((place) => (
                <PlaceCard key={place.id} slug={place.slug} place={place} savedPlaceIds={savedPlaceIds} userId={userId} />
              ))}
            </div>

            {places.data.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-lg font-medium">No places found.</div>
                <p className="mt-2 text-sm">Try adjusting your search criteria.</p>
              </div>
            )}

            {places.links && places.links.length > 0 && (
              <div className="mt-8 flex justify-center" role="navigation" aria-label="Pagination">
                <div className="flex space-x-2">
                  {places.links && places.links.length > 0 && (
          <div className="mt-6 flex justify-center" role="navigation" aria-label="Pagination">
        <nav className="flex space-x-2">
          {places.links.map((link, index) => {
        const isDisabled = !link.url;
        const label = link.label === '&laquo; Previous' 
          ? 'Previous' 
          : link.label === 'Next &raquo;' 
          ? 'Next' 
          : link.label;
        
        const totalPages = places.links.length - 2;
        const showLimited = totalPages > 3;
        const isNumber = !isNaN(Number(label));
        const pageNumber = Number(label);
        
        if (showLimited && isNumber && !link.active && pageNumber !== 1 && pageNumber !== totalPages) {
          if (pageNumber === 2 && !places.links[index - 1].active) {
            return <span key="ellipsis1" className="px-4 py-2 text-gray-300">...</span>;
          }
          if (pageNumber === totalPages - 1 && !places.links[index + 1].active) {
            return <span key="ellipsis2" className="px-4 py-2 text-gray-300">...</span>;
          }
          if (pageNumber !== 2 && pageNumber !== totalPages - 1) return null;
        }

        return (
          <button
            key={link.label}
            onClick={() => isDisabled ? null : window.location.href = link.url}
            disabled={isDisabled}
            aria-current={link.active ? 'page' : undefined}
            aria-label={`Page ${label}`}
            className={`
          px-4 py-2 rounded-md text-sm transition-colors
          ${link.active 
            ? 'bg-blue-700 text-white dark:bg-blue-800'
            : isDisabled
          ? 'bg-gray-800 text-gray-500 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed'
          : 'bg-gray-700 text-gray-200 hover:bg-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }
            `}
          >
            {label}
          </button>
        );
          })}
        </nav>
          </div>
        )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  </AppLayout>
  );
}