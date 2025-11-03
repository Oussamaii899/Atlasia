"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Globe,
  MapPin,
  Settings,
  Star,
  MessageSquare,
  Calendar,
  Edit,
  Heart,
  Camera,
  Share2,
  BookmarkPlus,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"
import { Head, router, usePage } from "@inertiajs/react"
import { useState } from "react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, reviews, ratingBreakdown, isCurrentUser, canEdit } = usePage().props
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [activeTab, setActiveTab] = useState("reviews")

  // Filter and sort reviews based on selections
  const filteredAndSortedReviews = reviews
    .filter((review) => filterBy === "all" || review.placeType.toLowerCase() === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date)
        case "oldest":
          return new Date(a.date) - new Date(b.date)
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        default:
          return 0
      }
    })


    const shareP = (user) => {
    if (navigator.share) {
      navigator.share({
        url: 'https://localhost/user/'+ user.id,
      })
    } else {
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <AppLayout>
      <Head title={`${user.name}'s Profile`} />

      {/* Banner Section */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-purple-600 to-blue-500 overflow-hidden">
        <img
          src={user.banner || "https://www.bing.com/th/id/OIP.buC_ueg_SXyBzNQ6fAvy-QHaDt?w=290&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2"}
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        {isCurrentUser && (
          <Button size="sm" variant="secondary" className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm" onClick={()=> router.visit('/settings/profile')}>
            <Camera className="h-4 w-4 mr-2" />
            Change Banner
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl -mt-16 relative z-10">
        {/* User Profile Section */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative -mt-20 md:-mt-24 ring-4 ring-background rounded-full">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isCurrentUser && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-2 right-2 rounded-full bg-background shadow-md"
                    onClick={()=> router.visit('/settings/profile')}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit profile picture</span>
                  </Button>
                )}
                {user.isOnline && (
                  <div className="absolute top-2 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left pt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.role === "admin" && <Badge variant="secondary">Admin</Badge>}
                </div>
                <p className="text-muted-foreground mt-1">@{user.username}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>{user.email }</span>
                  </div>
                </div>

                <p className="mt-4 text-sm">{user.bio}</p>

                <div className="flex justify-center md:justify-start gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.placesVisited}</div>
                    <div className="text-xs text-muted-foreground">Places Visited</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.reviewsWritten}</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.averageRating}</div>
                    <div className="text-xs text-muted-foreground">Avg. Rating</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                  {isCurrentUser ? (
                    <Button variant="outline" onClick={()=> router.visit('/settings/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={()=> router.visit('/chat/'+user.id)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat with {user.name.split(" ")[0]}
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={()=> shareP(user)}>
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share profile</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
