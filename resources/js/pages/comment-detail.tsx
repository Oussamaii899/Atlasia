"use client"

import type { BreadcrumbItem } from "@/types"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Calendar,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Mail,
  Clock,
  User,
  Reply,
  MapPin,
  Star,
  Phone,
  Globe,
  Trash2,
} from "lucide-react"
import { useState } from "react"

interface I_User {
  id: number
  name: string
  email: string
  avatar?: string
  created_at: string
  comments_count?: number
  posts_count?: number
}

interface Place {
  id: number
  name: string
  address: string
  city: string
  description: string
  email: string
  phone: string
  website?: string
  rating: number
  review_count: number
  lat: string
  lng: string
  amenities: string[]
  category_id: number
  publier: boolean
  created_at: string
  updated_at: string
}

interface I_Reply {
  id: number
  content: string
  user: I_User
  created_at: string
  updated_at: string
  is_published: boolean
  likes?: number
  dislikes?: number
}

interface Comment {
  id: number
  content: string
  user: I_User
  place: Place
  replies: I_Reply[]
  is_published: boolean
  created_at: string
  updated_at: string
  likes: number
  dislikes: number
  place_id: number
  user_id: number
}

interface CommentDetailProps {
  comment: Comment
}

export default function CommentDetail({ comment }: CommentDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Comments",
      href: "/comments",
    },
    {
      title: `Comment #${comment.id}`,
      href: `/comment/${comment.id}`,
    },
  ]

  const handleTogglePublish = (id: number, isPublished: boolean) => {
    router.put(
      `/comments/${id}/toggle-publish`,
      { is_published: isPublished },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Publication status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    )
  }

  const handleToggleReplyPublish = (id: number, isPublished: boolean) => {
    router.put(
      `/replies/${id}/toggle-publish`,
      { is_published: isPublished },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Reply status updated"),
        onError: () => toast.error("Failed to update reply status"),
      },
    )
  }

  const handleDeleteReply = (replyId: number) => {
    router.delete(`/replies/${replyId}`, {
      onSuccess: () => {
        toast.success("Reply deleted successfully")
        router.reload()
      },
      onError: () => {
        toast.error("Failed to delete reply")
      },
    })
  }

  const handleDeleteComment = () => {
    router.delete(`/comments/${comment.id}`, {
      onSuccess: () => {
        toast.success("Comment deleted successfully")
        router.get("/comments")
      },
      onError: () => {
        toast.error("Failed to delete comment")
      },
    })
    setDeleteDialogOpen(false)
  }

  const getPlaceLink = () => {
    return `/places/${comment.place.id}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  const getUserAvatar = (user: I_User) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover rounded-full"
        />
      )
    }

    // Fallback to initials
    const initials = user.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
        {initials}
      </div>
    )
  }

  const getReplyAvatar = (user: I_User) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover rounded-full"
        />
      )
    }

    const initials = user.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-xs">
        {initials}
      </div>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title={`Comment #${comment.id} Details`} />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.get("/comments")}
            className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Comments
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Comment Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comment #{comment.id} • {getTimeAgo(comment.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Comment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comment Card */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {getUserAvatar(comment.user)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{comment.user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{comment.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={comment.is_published ? "default" : "secondary"} className="dark:bg-gray-800">
                      {comment.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Switch
                      checked={comment.is_published}
                      onCheckedChange={(checked) => handleTogglePublish(comment.id, checked)}
                      className="dark:data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.likes || 0} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.dislikes || 0} dislikes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(comment.created_at)}</span>
                  </div>
                  {comment.updated_at !== comment.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {formatDate(comment.updated_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Replies Section */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Reply className="h-5 w-5" />
                  Replies ({comment.replies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comment.replies.length > 0 ? (
                  <div className="space-y-4">
                    {comment.replies.map((reply, index) => (
                      <div key={reply.id}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            {getReplyAvatar(reply.user)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white">{reply.user.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {getTimeAgo(reply.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={reply.is_published ? "default" : "secondary"}
                                  className="text-xs dark:bg-gray-800"
                                >
                                  {reply.is_published ? "Published" : "Draft"}
                                </Badge>
                                <Switch
                                  checked={reply.is_published}
                                  onCheckedChange={(checked) => handleToggleReplyPublish(reply.id, checked)}
                                  className="scale-75 dark:data-[state=checked]:bg-blue-600"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="h-6 px-2 text-xs dark:bg-red-900 dark:hover:bg-red-800"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </p>
                            {(reply.likes || reply.dislikes) && (
                              <div className="flex items-center gap-4 mt-2">
                                {reply.likes > 0 && (
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{reply.likes}</span>
                                  </div>
                                )}
                                {reply.dislikes > 0 && (
                                  <div className="flex items-center gap-1">
                                    <ThumbsDown className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{reply.dislikes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {index < comment.replies.length - 1 && <Separator className="mt-4 dark:bg-gray-800" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Reply className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No replies yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Replies will appear here when users respond to this comment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {getUserAvatar(comment.user)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{comment.user.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      {comment.user.email}
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-800" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member since</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(comment.user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {comment.user.comments_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total comments</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user.comments_count}
                      </span>
                    </div>
                  )}
                  {comment.user.posts_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total posts</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user.posts_count || 0}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Place Info */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <MapPin className="h-5 w-5" />
                  Related Place
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                    {comment.place.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.place.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({comment.place.review_count} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {comment.place.description}
                  </p>
                </div>

                <Separator className="dark:bg-gray-800" />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.place.address}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{comment.place.city}</p>
                    </div>
                  </div>

                  {comment.place.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{comment.place.phone}</span>
                    </div>
                  )}

                  {comment.place.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <a
                        href={comment.place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {comment.place.website}
                      </a>
                    </div>
                  )}

                  {comment.place.amenities && comment.place.amenities.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {comment.place.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs dark:border-gray-700">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getPlaceLink(), "_blank")}
                  className="w-full dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Place
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(`/user/${comment.user.id}`)}
                  className="w-full dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4 mr-2" />
                  View User Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(`/comments?search=${comment.user.name}`)}
                  className="w-full dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  User's Comments
                </Button>

                {/* Delete Comment Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full dark:bg-red-900 dark:hover:bg-red-800">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Comment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dark:bg-black dark:border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">Delete Comment</DialogTitle>
                      <DialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete this comment from <strong>{comment.user.name}</strong>? This
                        action cannot be undone and will also delete all {comment.replies.length} replies.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Comment Preview in Dialog */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {getUserAvatar(comment.user)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{comment.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(comment.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{comment.content}</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteComment}
                        className="dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Comment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
