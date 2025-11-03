"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Head, router, usePage } from "@inertiajs/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  TrendingDown,
  TrendingUp,
  MapPin,
  Heart,
  Star,
  Calendar,
  Trophy,
  Clock,
  MessageCircle,
  Users,
  UserPlus,
} from "lucide-react"

// Define proper TypeScript interfaces for our data
interface UserStats {
  placesVisited: number
  favorites: number
  reviews: number
}

interface Place {
  id: number
  name: string
  category: string
  location: string
  rating: number
  lastViewed?: string
  image?: string
}

interface Match {
  id: number
  match: string
  stadium: string
  date: string
  time: string
}

interface Support {
  id: number
  subject: string
  message: string
  category: string
  user?: {
    id: number
    name: string
  }
  created_at?: string
}

interface Comment {
  id: number
  content: string
  user?: {
    id: number
    name: string
  }
  created_at?: string
  place?: {
    name: string
  }
  rating?: number
}

interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  avatar?: string
}

interface DashboardProps {
  user: User
  isAdmin?: boolean
  totalUsers?: number
  totalPlaces?: number
  monthlyUsers?: number
  monthlyPlaces?: number
  userTrend?: number
  placeTrend?: number
  userStats?: UserStats
  recentPlaces?: Place[]
  favoriteSpots?: Place[]
  supports?: Support[]
  comments?: Comment[]
  recentUsers?: RecentUser[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
]

// Reusable components for better organization
const StatCard = ({ title, value, description, trend = null, icon = null, upcomingMatches }) => (
  <Card className="@container/card relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
    <CardHeader className="relative pb-2">
      <CardDescription className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
        {title}
      </CardDescription>
      <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        {value}
      </CardTitle>
      {trend !== null && (
        <div className="absolute right-4 top-13">
          <TrendBadge value={trend} />
        </div>
      )}
      {!trend && (
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="rounded-lg text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            All Time
          </Badge>
        </div>
      )}
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
      {trend !== null && (
        <div className="flex gap-2 font-medium text-xs">
          {trend > 0 ? (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              <span>Trending up this month</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
              <TrendingDown className="size-3" />
              <span>Trending down this month</span>
            </div>
          )}
        </div>
      )}
      <div className="text-muted-foreground/70 text-xs">{description}</div>
    </CardFooter>
  </Card>
)

const TrendBadge = ({ value }) => (
  <Badge
    variant="outline"
    className={`flex gap-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
      value > 0
        ? "text-emerald-600 bg-emerald-50/80 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800"
        : "text-red-500 bg-red-50/80 border-red-200 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800"
    }`}
  >
    {value > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
    {Math.abs(value)}%
  </Badge>
)

const UserStatCard = ({ icon, value, label, color,upcomingMatches }) => (
  <div className={`text-center p-3 bg-${color}-50 dark:bg-${color}-900 rounded-lg`}>
    {icon}
    <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-200`}>{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
  </div>
)

export default function Dashboard({
  user,
  isAdmin = false,
  totalUsers = 0,
  totalPlaces = 0,
  monthlyUsers = 0,
  monthlyPlaces = 0,
  userTrend = 0,
  placeTrend = 0,
  userStats = { placesVisited: 0, favorites: 0, reviews: 0 },
  recentPlaces = [],
  favoriteSpots = [],
  supports = [],
  comments = [],
  recentUsers = [],
  upcomingMatches
}: DashboardProps) {
  // Get data from page props if not provided directly
  const pageProps = usePage().props
  const pageSupports = supports.length ? supports : pageProps.supports || []
  const pageComments = comments.length ? comments : pageProps.comments || []
  const pageRecentUsers = recentUsers.length ? recentUsers : pageProps.recentUsers || []

  function handleViewAllComments() {
    router.visit("/comments")
  }

  function handleViewAllSupports() {
    router.visit("/reports")
  }

  function handleViewAllUsers() {
    router.visit("/users")
  }

  // Sample data for user dashboard if not provided


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
        {isAdmin ? (
          <AdminDashboard
            totalUsers={totalUsers}
            totalPlaces={totalPlaces}
            monthlyUsers={monthlyUsers}
            monthlyPlaces={monthlyPlaces}
            userTrend={userTrend}
            placeTrend={placeTrend}
            supports={pageSupports}
            comments={pageComments}
            recentUsers={pageRecentUsers}
            onViewAllComments={handleViewAllComments}
            onViewAllSupports={handleViewAllSupports}
            onViewAllUsers={handleViewAllUsers}
          />
        ) : (
          <UserDashboard
            user={user}
            userStats={userStats}
            recentPlaces={recentPlaces}
            favoriteSpots={favoriteSpots}
            upcomingMatches={upcomingMatches}
          />
        )}
      </div>
    </AppLayout>
  )
}

function AdminDashboard({
  totalUsers,
  totalPlaces,
  monthlyUsers,
  monthlyPlaces,
  userTrend,
  placeTrend,
  supports,
  comments,
  recentUsers,
  onViewAllComments,
  onViewAllSupports,
  onViewAllUsers,
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Users" value={totalUsers} description="Users All time" />
        <StatCard title="Total Places" value={totalPlaces} description="Places All time" />
        <StatCard title="New Places" value={monthlyPlaces} description="Places for the last month" trend={placeTrend} />
        <StatCard title="New Users" value={monthlyUsers} description="Users for the last month" trend={userTrend} />
      </div>

      {/* Enhanced Reports and Comments Section - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Enhanced Support Reports Card */}
        <Card className="@container/card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Send className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold">Support Reports</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Recent user reports and issues</CardDescription>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.visit("/reports")}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950"
            >
              View All Reports
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {supports.length > 0 ? (
              supports.slice(0, 3).map((support, idx) => (
                <div
                  key={support.id || idx}
                  className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 cursor-pointer"
                  onClick={() => router.visit(`/report/${support.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Report Header */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-md shrink-0 mt-0.5">
                          <Send className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                            {support.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            >
                              {support.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Report
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6 sm:ml-8">
                        <Avatar className="h-3 w-3 sm:h-4 sm:w-4">
                          <AvatarFallback className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            {support.user?.name?.substring(0, 2).toUpperCase() || "AN"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">{support.user?.name || "Anonymous"}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {new Date(support.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Message Preview */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 ml-6 sm:ml-8 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {support.message.length > 10 ? `${support.message.substring(0, 20)}...` : support.message}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-orange-100 dark:hover:bg-orange-900 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.visit(`/report/${support.id}`)
                      }}
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 mb-3">
                  <Send className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No support reports</p>
                <p className="text-xs text-muted-foreground mt-1">Reports will appear here when users submit them</p>
              </div>
            )}

            {supports.length > 3 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => router.visit("/reports")}
                  variant="outline"
                  className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950"
                >
                  View All Reports
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Comments Card */}
        <Card className="@container/card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold">User Comments</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest user reviews and feedback</CardDescription>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.visit("/comments")}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
            >
              View All Comments
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {comments.length > 0 ? (
              comments.slice(0, 4).map((comment, idx) => (
                <div
                  key={comment.id || idx}
                  className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
                  onClick={() => router.visit(`/comment/${comment.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Comment Header */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md shrink-0 mt-0.5">
                          <MessageCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {comment.user?.name?.substring(0, 2).toUpperCase() || "AN"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-xs sm:text-sm truncate">
                              {comment.user?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {new Date(comment.created_at || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Rating and badges */}
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            {comment.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{comment.rating}</span>
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Review
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Comment Content */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 ml-6 sm:ml-8 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {comment.content}
                      </p>

                      {/* Place Info */}
                      {comment.place && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-6 sm:ml-8">
                          <MapPin className="h-3 w-3" />
                          <span>Comment on</span>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate max-w-24 sm:max-w-none"
                          >
                            {comment.place.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.visit(`/comment/${comment.id}`)
                      }}
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-3">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No comments available</p>
                <p className="text-xs text-muted-foreground mt-1">User comments will appear here</p>
              </div>
            )}

            {comments.length > 4 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => router.visit("/comments")}
                  variant="outline"
                  className="w-full hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                >
                  View All {comments.length} Comments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Section - Fully Responsive */}
      <Card className="@container/card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold">Recent Users</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest user registrations</CardDescription>
              </div>
            </div>
          </div>
          <Button
            onClick={onViewAllUsers}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto shrink-0 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
          >
            View All Users
          </Button>
        </CardHeader>

        <CardContent>
          {recentUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {recentUsers.slice(0, 8).map((user, idx) => (
                <div
                  key={user.id || idx}
                  className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:bg-green-50/50 dark:hover:bg-green-950/20 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 cursor-pointer"
                  onClick={() => router.visit(`/user/${user.id}`)}
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    {/* User Avatar */}
                    <div className="relative">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold text-xs sm:text-sm">
                          {user.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* User Info */}
                    <div className="text-center space-y-1 w-full">
                      <h3 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>

                      {/* Role Badge */}
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={`text-xs ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UserPlus className="h-3 w-3" />
                      <span className="hidden sm:inline">Joined</span>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-full hover:bg-green-100 dark:hover:bg-green-900 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.visit(`/user/${user.id}`)
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No recent users</p>
              <p className="text-xs text-muted-foreground mt-1">New user registrations will appear here</p>
            </div>
          )}

          {recentUsers.length > 8 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={onViewAllUsers}
                variant="outline"
                className="w-full hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
              >
                View All {recentUsers.length} Users
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UserDashboard({ user, userStats, recentPlaces, favoriteSpots, upcomingMatches }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Ready to explore more of Morocco for FIFA 2030?
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mx-0">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-lg sm:text-xl">{user.name}</CardTitle>
              <CardDescription className="text-sm">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Places Visited */}
            <UserStatCard
              icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-600 dark:text-blue-300" />}
              value={userStats?.placesVisited ?? 0}
              label="Places Visited"
              color="blue"
            />

            {/* Saves */}
            <UserStatCard
              icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-red-600 dark:text-red-300" />}
              value={userStats?.favorites ?? 0}
              label="Saves"
              color="red"
            />

            {/* Reviews */}
            <UserStatCard
              icon={<Star className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-yellow-600 dark:text-yellow-300" />}
              value={userStats?.reviews ?? 0}
              label="Reviews"
              color="yellow"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recently Viewed Places */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Recently Viewed Places
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Places you've explored recently
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4">
              {recentPlaces.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven't viewed any places yet.</p>
              ) : (
                recentPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => router.visit(`/places/${place.id}`)}
                    className="flex items-center gap-3 sm:gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {place.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <Badge variant="outline" className="text-xs">
                          {place.category}
                        </Badge>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{place.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                            {place.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">• {place.lastViewed}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Button variant="outline" className="w-full" onClick={() => router.visit('/history')}>
                View All Recent Places
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Matches */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                Upcoming Matches
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">FIFA World Cup 2030 schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {console.log(upcomingMatches)}
              {upcomingMatches.map((match) => (
                <div key={match.id} className="p-3 border rounded-lg">
                  <h3 className="font-semibold text-xs sm:text-sm">{match.match}</h3>
                  <p className="text-xs text-gray-600 mt-1">{match.stadium}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{match.date}</span>
                    <span>•</span>
                    <span>{match.time}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={()=> router.visit('/matches')}>
                View Full Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Favorite Spots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            Your Favorite Spots
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Places you've saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favoriteSpots.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">
                You haven't saved any places yet.
              </p>
            ) : (
              favoriteSpots.map((spot) => (
                <div key={spot.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{spot.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {spot.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{spot.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{spot.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {favoriteSpots.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.visit('/saves')} >View All Favorites</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
