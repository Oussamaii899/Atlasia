"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Search, SlidersHorizontal, Star, X } from "lucide-react"
 import { router } from '@inertiajs/react';
const categories = [
  "Restaurant",
  "Hotel",
  "Shopping",
  "Stadium"
]

const cities = [
  "Casablanca",
  "Rabat",
  "Fes",
  "Marrakech",
  "Agadir",
  "Oujda",
  "Meknes",
  "Tanger",
  "Tétouan",
  "Safi",
]




export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  selectedCities,
  setSelectedCities,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
}) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
 

const handleFilterChange = () => {
  router.get(route('post.index'), {
    search: searchQuery,
    categories: selectedCategories,
    cities: selectedCities,
    min_rating: minRating,
    sort: sortBy,
  }, {
    preserveState: true,
    preserveScroll: true,
  });
};
const firstRender = React.useRef(true)

React.useEffect(() => {
  if (firstRender.current) {
    firstRender.current = false
    return
  }
  handleFilterChange()
}, [searchQuery, selectedCategories, selectedCities, minRating,  sortBy])
  React.useEffect(() => {
    handleFilterChange();
  }, [searchQuery, selectedCategories, selectedCities, minRating,  sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleCityChange = (city: string, checked: boolean) => {
    if (checked) {
      setSelectedCities([...selectedCities, city])
    } else {
      setSelectedCities(selectedCities.filter((c) => c !== city))
    }
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedCities([])
    setMinRating(0)
    setSortBy("")
  }

  const removeFilter = (type: string, value: string) => {
    if (type === "category") {
      setSelectedCategories(selectedCategories.filter((c) => c !== value))
    } else if (type === "city") {
      setSelectedCities(selectedCities.filter((c) => c !== value))
    }
  }

  const activeFiltersCount =
    selectedCategories.length + selectedCities.length + (minRating > 0 ? 1 : 0)

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stadiums, hotels ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-4 relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-1 text-xs">
                    Clear all
                  </Button>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <Label htmlFor={category} className="text-xs">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Cities */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cities</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {cities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={city}
                          checked={selectedCities.includes(city)}
                          onCheckedChange={(checked) => handleCityChange(city, checked as boolean)}
                        />
                        <Label htmlFor={city} className="text-xs">
                          {city}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>


                <Separator />

                {/* Rating */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Minimum Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={minRating >= rating ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
        </Popover>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-12">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_comments">Most Comments</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedCities.length > 0 || minRating > 0 ) && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1 z-50">
                {category}
                <button
                  type="button"
                  onClick={() => removeFilter("category", category)}
                  className="ml-1 p-0 cursor-pointer focus:outline-none"
                  aria-label={`Remove filter ${category}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {selectedCities.map((city) => (
              <Badge key={city} variant="secondary" className="gap-1 z-50">
                {city}
                {/* <X className="h-3 w-3 cursor-pointer pointer-events-auto" onClick={() => removeFilter("city", city)} /> */}
                                <button
                  type="button"
                  onClick={() => removeFilter("city", city)}
                  className="ml-1 p-0 cursor-pointer focus:outline-none"
                  aria-label={`Remove filter ${city}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {minRating > 0 && (
              <Badge variant="secondary" className="gap-1 z-50">
                {minRating}+ stars
                                <button
                  type="button"
                  onClick={() => setMinRating(0)}
                  className="ml-1 p-0 cursor-pointer focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
              Clear all
            </Button>
          </div>
        </Card>
      )}

      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {searchQuery ? `Showing results for "${searchQuery}"` : "Browse All Places"}
          {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`}
        </span>
        <span>   </span>
      </div>
    </div>
  )
}
