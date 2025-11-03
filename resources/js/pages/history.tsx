"use client"

import { useState, useEffect } from "react"
import { Head, router } from "@inertiajs/react"

import AppLayout from "@/layouts/app-layout"
import {
  Search,
  Navigation,
  MapPin,
  Filter,
  X,
  Check,
  Heart,
  Share2,
  Camera,
  Star,
  MoreHorizontal,
  ChevronUp,
  Loader2,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const breadcrumbs = [{ title: "History", href: "/history" }]

const categories = ["All", "Stadium", "Hotel", "Restaurant"]

const timePeriods = [
  { label: "Any time", value: "any" },
  { label: "Last month", value: "month" },
  { label: "Last 3 months", value: "quarter" },
  { label: "Last 6 months", value: "half-year" },
  { label: "Last year", value: "year" },
]

const ITEMS_PER_PAGE = 10
const SHOW_MORE_CLICKS_THRESHOLD = 2

export default function History({ places, userId, histoires }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPlaces, setFilteredPlaces] = useState(places)

  console.log("Histoires data:", histoires)

  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE)
  const [showMoreClickCount, setShowMoreClickCount] = useState(0)
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false)
  const [showAutoLoadDialog, setShowAutoLoadDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("any")
  const [sortBy, setSortBy] = useState("recent")
  const [filtersApplied, setFiltersApplied] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!autoLoadEnabled) return

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreItems()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [autoLoadEnabled, displayedItemsCount, filteredPlaces])

  useEffect(() => {
    let filtered = places.filter((place) => {
      const nameMatch = place.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const descMatch = place.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const searchMatch = nameMatch || descMatch

      const categoryMatch =
        selectedCategory === "All" ||
        (place.category && place.category.nom.toLowerCase() === selectedCategory.toLowerCase())

      let timeMatch = true
      if (selectedTimePeriod !== "any") {
        const now = new Date()
        const placeHistoire = histoires.find((h) => h.place_id === place.id)

        if (placeHistoire && placeHistoire.created_at) {
          const visitDate = new Date(placeHistoire.created_at)

          switch (selectedTimePeriod) {
            case "month":
              // Last month
              const oneMonthAgo = new Date(now)
              oneMonthAgo.setMonth(now.getMonth() - 1)
              timeMatch = visitDate >= oneMonthAgo
              break
            case "quarter":
              // Last 3 months
              const threeMonthsAgo = new Date(now)
              threeMonthsAgo.setMonth(now.getMonth() - 3)
              timeMatch = visitDate >= threeMonthsAgo
              break
            case "half-year":
              const sixMonthsAgo = new Date(now)
              sixMonthsAgo.setMonth(now.getMonth() - 6)
              timeMatch = visitDate >= sixMonthsAgo
              break
            case "year":
              const oneYearAgo = new Date(now)
              oneYearAgo.setFullYear(now.getFullYear() - 1)
              timeMatch = visitDate >= oneYearAgo
              break
            default:
              timeMatch = true
          }
        } else {
          timeMatch = false
        }
      }

      return searchMatch && categoryMatch && timeMatch
    })

    if (sortBy === "recent") {
      filtered = [...filtered].sort((a, b) => {
        const aHistoire = histoires.find((h) => h.place_id === a.id)
        const bHistoire = histoires.find((h) => h.place_id === b.id)
        const aDate = aHistoire?.created_at ? new Date(aHistoire.created_at).getTime() : 0
        const bDate = bHistoire?.created_at ? new Date(bHistoire.created_at).getTime() : 0
        return bDate - aDate
      })
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => {
        return (a.name || "").localeCompare(b.name || "")
      })
    }

    setFilteredPlaces(filtered)
    setDisplayedItemsCount(ITEMS_PER_PAGE)
    setShowMoreClickCount(0)

    setFiltersApplied(selectedCategory !== "All" || selectedTimePeriod !== "any" || sortBy !== "recent")
  }, [searchTerm, places, selectedCategory, selectedTimePeriod, sortBy, histoires])

  console.log("Filtering debug:", {
    selectedTimePeriod,
    totalPlaces: places.length,
    filteredPlaces: filteredPlaces.length,
    histoires: histoires.length,
  })

  const handleDelete = (placeId) => {
    toast.promise(
      new Promise((resolve, reject) => {
        router.delete(route("history.destroy", placeId), {
          onSuccess: () => {
            setFilteredPlaces((prev) => prev.filter((place) => place.id !== placeId))
            resolve()
          },
          onError: () => reject(),
        })
      }),
      {
        loading: "Deleting...",
        success: "History entry deleted!",
        error: "Failed to delete.",
      },
    )
  }

  const resetFilters = () => {
    setSelectedCategory("All")
    setSelectedTimePeriod("any")
    setSortBy("recent")
  }

  const loadMoreItems = () => {
    if (displayedItemsCount >= filteredPlaces.length || isLoading) return

    setIsLoading(true)

    setTimeout(() => {
      setDisplayedItemsCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredPlaces.length))
      setIsLoading(false)
    }, 500)
  }

  const handleShowMore = () => {
    const newClickCount = showMoreClickCount + 1
    setShowMoreClickCount(newClickCount)

    if (newClickCount >= SHOW_MORE_CLICKS_THRESHOLD && !autoLoadEnabled) {
      setShowAutoLoadDialog(true)
    } else {
      loadMoreItems()
    }
  }

  const enableAutoLoad = () => {
    setAutoLoadEnabled(true)
    setShowAutoLoadDialog(false)
    loadMoreItems()
    toast.success("Auto-loading enabled! Scroll down to load more items automatically.")
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const toggleFavorite = (placeId) => {
    toast.success("Added to favorites!")
  }

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

  const displayedPlaces = filteredPlaces.slice(0, displayedItemsCount)
  const hasMoreItems = displayedItemsCount < filteredPlaces.length

  console.log(places)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="History" />
      <main className="min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
        {/* Redesigned Header Section */}
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Travel History</h1>
                <p className="text-blue-100 text-sm md:text-base lg:text-lg max-w-2xl">
                  Relive your amazing adventures and discover the memories you've created
                </p>
              </div>

              {/* Search and Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search your adventures..."
                    className="pl-10 bg-white/90 dark:bg-gray-800/90 border-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 h-11 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Desktop Filter Dropdown */}
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="h-11 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white border-white/30 dark:border-white/20 backdrop-blur-sm"
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        {filtersApplied && <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full"></span>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 dark:bg-black dark:border-gray-900">
                      <DropdownMenuLabel className="dark:text-gray-200">Filter Places</DropdownMenuLabel>
                      <DropdownMenuSeparator className="dark:bg-gray-900" />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                          Category
                        </DropdownMenuLabel>
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category}
                            className="flex items-center justify-between cursor-pointer dark:text-gray-300 dark:hover:bg-gray-900"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                            {selectedCategory === category && (
                              <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="dark:bg-gray-900" />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                          Time Period
                        </DropdownMenuLabel>
                        {timePeriods.map((period) => (
                          <DropdownMenuItem
                            key={period.value}
                            className="flex items-center justify-between cursor-pointer dark:text-gray-300 dark:hover:bg-gray-900"
                            onClick={() => setSelectedTimePeriod(period.value)}
                          >
                            {period.label}
                            {selectedTimePeriod === period.value && (
                              <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="dark:bg-gray-900" />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                          Sort By
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer dark:text-gray-300 dark:hover:bg-gray-900"
                          onClick={() => setSortBy("recent")}
                        >
                          Most Recent
                          {sortBy === "recent" && <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer dark:text-gray-300 dark:hover:bg-gray-900"
                          onClick={() => setSortBy("name")}
                        >
                          Name (A-Z)
                          {sortBy === "name" && <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="dark:bg-gray-900" />
                      <DropdownMenuItem
                        className="text-red-500 dark:text-red-400 cursor-pointer dark:hover:bg-gray-900"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Filter Sheet */}
                <div className="sm:hidden w-full">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full h-11 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white border-white/30 dark:border-white/20 backdrop-blur-sm"
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        {filtersApplied && <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full"></span>}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] dark:bg-black dark:border-gray-900">
                      <SheetHeader>
                        <SheetTitle className="dark:text-gray-100 text-lg">Filter Places</SheetTitle>
                        <SheetDescription className="dark:text-gray-400 text-sm">
                          Refine your travel history by applying filters
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium dark:text-gray-300">Category</h3>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 h-10">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                              <SelectGroup>
                                <SelectLabel className="dark:text-gray-400">Categories</SelectLabel>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category} className="dark:text-gray-300">
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium dark:text-gray-300">Time Period</h3>
                          <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                            <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 h-10">
                              <SelectValue placeholder="Select time period" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                              <SelectGroup>
                                <SelectLabel className="dark:text-gray-400">Time Periods</SelectLabel>
                                {timePeriods.map((period) => (
                                  <SelectItem key={period.value} value={period.value} className="dark:text-gray-300">
                                    {period.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium dark:text-gray-300">Sort By</h3>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 h-10">
                              <SelectValue placeholder="Select sorting" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                              <SelectGroup>
                                <SelectLabel className="dark:text-gray-400">Sort Options</SelectLabel>
                                <SelectItem value="recent" className="dark:text-gray-300">
                                  Most Recent
                                </SelectItem>
                                <SelectItem value="name" className="dark:text-gray-300">
                                  Name (A-Z)
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <SheetFooter className="flex flex-row gap-3 sm:justify-between">
                        <Button
                          variant="outline"
                          className="flex-1 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 h-10"
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                        <SheetClose asChild>
                          <Button className="flex-1 h-10">Apply Filters</Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Filter chips - show active filters */}
          {filtersApplied && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
              {selectedCategory !== "All" && (
                <Badge
                  key="category-filter"
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1 text-xs flex items-center gap-1"
                >
                  {selectedCategory}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCategory("All")
                    }}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {selectedTimePeriod !== "any" && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-3 py-1 text-xs flex items-center gap-1"
                >
                  {timePeriods.find((p) => p.value === selectedTimePeriod)?.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTimePeriod("any")
                    }}
                    className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {sortBy !== "recent" && (
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs flex items-center gap-1"
                >
                  Sorted: {sortBy === "name" ? "Name" : "Recent"}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSortBy("recent")
                    }}
                    className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                onClick={resetFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results count and auto-load status */}
          {filteredPlaces.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {displayedPlaces.length} of {filteredPlaces.length} places
                {autoLoadEnabled && (
                  <Badge className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                    Auto-loading enabled
                  </Badge>
                )}
              </p>
            </div>
          )}

          {/* Completely Redesigned Places Grid - Max 4 Cards Per Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPlaces.length > 0 ? (
              displayedPlaces.map((place, index) => (
                <Card
                  key={place.id}
                  className="group overflow-hidden rounded-xl border-0 bg-white dark:bg-gray-950 shadow-md hover:shadow-xl transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Enhanced Image Container with Overlay */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        place.images && place.images.length > 0
                          ? place.images[0].url
                          : "/placeholder.svg?height=300&width=400"
                      }
                      alt={place.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 filter contrast-105 saturate-105"
                      loading="lazy"
                    />

                    {/* Enhanced Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 opacity-90 group-hover:opacity-75 transition-opacity duration-300"></div>

                    {/* Subtle Vignette Effect */}
                    <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>

                    {/* Category Badge */}
                    {place.category && (
                      <div className="absolute top-3 left-3">
                        <Badge
                          id="category"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 border-0"
                        >
                          {place.category.nom}
                        </Badge>
                      </div>
                    )}

                    {/* Rating Badge - Top Right */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-500/90 text-white text-xs px-2 py-1 border-0 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{place.rating}</span>
                      </Badge>
                    </div>

                    {/* Photo Count Badge */}
                    {place.images && place.images.length > 1 && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-black/60 text-white text-xs px-2 py-1 border-0 flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          <span>{place.images.length} photos</span>
                        </Badge>
                      </div>
                    )}

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-lg text-white line-clamp-2 drop-shadow-lg">{place.name}</h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    {/* Location and Date Row */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span>{place.address || "Unknown location"}</span>
                      </div>
                      {histoires && histoires.find((h) => h.place_id === place.id)?.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span>
                            {new Date(histoires.find((h) => h.place_id === place.id).created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {place.description ||
                        "An amazing place waiting to be explored. Create memories that will last a lifetime in this beautiful destination."}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border-0 h-10"
                        onClick={() => router.visit(route("places.show", place.slug))}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Explore
                      </Button>

                      <div className="flex items-center gap-2">

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 dark:bg-black dark:border-gray-900">
                            <DropdownMenuItem
                              className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-900"
                              onClick={() => sharePlace(place)}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="dark:bg-gray-900" />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-gray-900"
                              onClick={() => handleDelete(place.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-0 bg-white dark:bg-gray-950 rounded-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-4 sm:px-8">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                      <Search className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
                      No places found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
                      {searchTerm || filtersApplied
                        ? `No adventures match your search${searchTerm ? ` for "${searchTerm}"` : ""} and filters. Try adjusting your criteria.`
                        : "Start your journey by exploring new places and they'll appear here."}
                    </p>
                    {(searchTerm || filtersApplied) && (
                      <div className="flex flex-wrap gap-3 mt-8">
                        {searchTerm && (
                          <Button
                            variant="outline"
                            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear Search
                          </Button>
                        )}
                        {filtersApplied && (
                          <Button
                            variant="outline"
                            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                            onClick={resetFilters}
                          >
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Show More Button */}
          {hasMoreItems && !autoLoadEnabled && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleShowMore}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-8 py-3 h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Show More (${Math.min(ITEMS_PER_PAGE, filteredPlaces.length - displayedItemsCount)} more)`
                )}
              </Button>
            </div>
          )}

          {/* Auto-loading indicator */}
          {autoLoadEnabled && hasMoreItems && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scroll down to load more...</span>
              </div>
            </div>
          )}

          {/* End of results indicator */}
          {!hasMoreItems && filteredPlaces.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                🎉 You've reached the end! All {filteredPlaces.length} places are now displayed.
              </p>
            </div>
          )}

          {/* Stats Section */}
          {filteredPlaces.length > 0 && (
            <div className="mt-8">
              <Card className="bg-white dark:bg-gray-950 border-0 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-black p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Travel Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{filteredPlaces.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Places</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">
                        {filteredPlaces.filter((p) => p.images?.length > 0).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">With Photos</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-500">
                        {Math.round(
                          (filteredPlaces.filter((p) => p.description).length / filteredPlaces.length) * 100,
                        ) || 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Documented</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                        {filteredPlaces.reduce((acc, p) => acc + (p.images?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Photos</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}

        {/* Auto-load Dialog */}
        <AlertDialog open={showAutoLoadDialog} onOpenChange={setShowAutoLoadDialog}>
          <AlertDialogContent className="dark:bg-black dark:border-gray-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-gray-100">Enable Auto-Loading?</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-400">
                You've clicked "Show More" {SHOW_MORE_CLICKS_THRESHOLD} times. Would you like to enable automatic
                loading as you scroll down? This will make browsing your travel history more seamless.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowAutoLoadDialog(false)
                  loadMoreItems()
                }}
                className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                No, keep manual
              </AlertDialogCancel>
              <AlertDialogAction onClick={enableAutoLoad}>Yes, enable auto-loading</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.3) 100%);
        }
      `}</style>
    </AppLayout>
  )
}
