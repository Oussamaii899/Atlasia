"use client"

import type React from "react"

import type { BreadcrumbItem } from "@/types"
import { useEffect, useState } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Calendar, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Comments",
    href: "/comments",
  },
]

interface Comment {
  id: number
  author_name: string
  author_email: string
  content: string
  post_title?: string
  post_slug?: string
  post_id?: number
  is_published: boolean
  created_at: string
  updated_at: string
  replies_count?: number
  likes_count?: number
  dislikes_count?: number
  user: {
    id: number
    name: string
    email: string
    avatar?: string
  }
  place: {
    id: number
    name: string
    address?: string
  }
  replies: any[]
  likes: number
  dislikes: number
}

interface CommentsData {
  data: Comment[]
  prev_page_url: string | null
  next_page_url: string | null
  current_page: number
  last_page: number
  total: number
}

export default function Comments({ comments }: { comments: CommentsData }) {
  const { data } = comments
  const [selectedRows, setSelectedRows] = useState(new Set<number>())

  const { filters } = usePage().props as { filters: { search?: string } }
  const [search, setSearch] = useState(filters.search || "")

  const handleDelete = (id: number) => {
    router.delete(`/comments/${id}`, {
      onSuccess: () => {
        toast.success("Comment deleted successfully")
        router.reload()
      },
      onError: () => {
        toast.error("Failed to delete comment")
        console.error("Failed to delete comment")
      },
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      "/comments",
      { search },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        "/comments",
        { search },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        },
      )
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  const handleRowSelect = (commentId: number) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (newSelected.has(commentId)) {
        newSelected.delete(commentId)
      } else {
        newSelected.add(commentId)
      }
      return newSelected
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((comment) => comment.id)))
    }
  }

  const handleBulkDelete = () => {
    router.post(
      "/comments/bulk-delete",
      {
        ids: Array.from(selectedRows),
      },
      {
        onSuccess: () => {
          toast.success("Selected comments deleted")
          setSelectedRows(new Set())
          router.reload()
        },
        onError: () => toast.error("Failed to delete selected comments"),
      },
    )
  }

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

  const truncateComment = (text: string, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const getPostLink = (comment: Comment) => {
    if (comment.place.id) {
      return `/places/${comment.place.id}`
    } else if (comment.place?.id) {
      return `/places/${comment.place.id}`
    }
    return "#"
  }

  const getUserAvatar = (user: Comment["user"], size: "sm" | "md" = "md") => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
    }

    if (user.avatar) {
      return (
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.name}
          className={`${sizeClasses[size]} object-cover rounded-full`}
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
      <div
        className={`${sizeClasses[size]} bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold`}
      >
        {initials}
      </div>
    )
  }

  console.log("Comments data:", data)
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title="Comments Management" />

      {/* Header Section */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Comments Management</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              Manage and moderate user comments
            </p>
          </div>
        </div>

        {/* Search and Actions Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-black p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <form onSubmit={handleSearch} className="w-full">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments, authors..."
              className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </form>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {selectedRows.size} selected
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full sm:w-auto dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                  >
                    Delete ({selectedRows.size})
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 dark:bg-black dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Delete Selected Comments</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Are you sure you want to delete {selectedRows.size} selected comments? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="w-full sm:w-auto dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                    >
                      Delete Selected
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Comments Table */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white dark:bg-black rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Mobile View */}
          <div className="block sm:hidden">
            {data.length ? (
              <div className="divide-y dark:divide-gray-800">
                {data.map((comment) => (
                  <div key={comment.id} className="p-4 space-y-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRows.has(comment.id)}
                            onCheckedChange={() => handleRowSelect(comment.id)}
                            className="dark:border-gray-700 dark:data-[state=checked]:bg-blue-600"
                          />
                          <div className="flex items-center gap-3">
                            {getUserAvatar(comment.user, "sm")}
                            <div>
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {comment.user.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{comment.user.email}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="text-sm text-gray-900 dark:text-white leading-relaxed cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => router.get(`/comments/${comment.id}`)}
                      >
                        {truncateComment(comment.content)}
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-gray-500 dark:text-gray-600" />
                          <span>
                            {comment.replies?.length || 0} {comment.replies?.length === 1 ? "reply" : "replies"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span>{comment.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                          <span>{comment.dislikes || 0}</span>
                        </div>
                      </div>

                      {comment.place?.name && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Place:</span>
                          <a
                            href={getPostLink(comment)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {truncateComment(comment.place.name, 30)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              comment.is_published
                                ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {comment.is_published ? "Published" : "Draft"}
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={comment.is_published}
                              onCheckedChange={(checked) => handleTogglePublish(comment.id, checked)}
                              className="dark:data-[state=checked]:bg-blue-600"
                            />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 px-2 text-xs dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                                >
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="mx-4 dark:bg-black dark:border-gray-800">
                                <DialogHeader>
                                  <DialogTitle className="dark:text-white">Delete Comment</DialogTitle>
                                  <DialogDescription className="dark:text-gray-400">
                                    Are you sure you want to delete this comment from {comment.user.name}? This action
                                    cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                  <DialogClose asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full sm:w-auto dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                                    >
                                      Cancel
                                    </Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(comment.id)}
                                    className="w-full sm:w-auto dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-medium">No comments found</p>
                  <p className="text-sm">Comments will appear here when users start engaging with your content.</p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
                  <TableHead className="w-12 dark:text-gray-400">
                    <Checkbox
                      checked={selectedRows.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="dark:border-gray-700 dark:data-[state=checked]:bg-blue-600"
                    />
                  </TableHead>
                  <TableHead className="w-48 dark:text-gray-400">Author</TableHead>
                  <TableHead className="min-w-80 dark:text-gray-400">Content</TableHead>
                  <TableHead className="w-20 dark:text-gray-400">Replies</TableHead>
                  <TableHead className="w-16 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs">Likes</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-20 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3 text-red-500" />
                      <span className="text-xs">Dislikes</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-48 dark:text-gray-400">Place</TableHead>
                  <TableHead className="w-24 dark:text-gray-400">Published</TableHead>
                  <TableHead className="w-32 dark:text-gray-400">Date</TableHead>
                  <TableHead className="w-24 dark:text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length ? (
                  data.map((comment) => (
                    <TableRow
                      key={comment.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900 border-b dark:border-gray-800 ${selectedRows.has(comment.id) ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(comment.id)}
                          onCheckedChange={() => handleRowSelect(comment.id)}
                          className="dark:border-gray-700 dark:data-[state=checked]:bg-blue-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getUserAvatar(comment.user)}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{comment.user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{comment.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p
                            className="text-sm text-gray-900 dark:text-white leading-relaxed cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => router.get(`/comments/${comment.id}`)}
                          >
                            {truncateComment(comment.content)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.replies?.length || 0}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {comment.replies?.length === 1 ? "reply" : "replies"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.likes || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.dislikes || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {comment.place ? (
                          <a
                            href={getPostLink(comment)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1 max-w-48"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="truncate">{comment.place.name}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-600">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={comment.is_published}
                          onCheckedChange={(checked) => handleTogglePublish(comment.id, checked)}
                          className="dark:data-[state=checked]:bg-blue-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-2 dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                            >
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="dark:bg-black dark:border-gray-800">
                            <DialogHeader>
                              <DialogTitle className="dark:text-white">Delete Comment</DialogTitle>
                              <DialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete this comment from {comment.user.name}? This action
                                cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
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
                                onClick={() => handleDelete(comment.id)}
                                className="dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
                        <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                        <p className="text-lg font-medium">No comments found</p>
                        <p className="text-sm">
                          Comments will appear here when users start engaging with your content.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              Showing {data.length} of {comments.total} comments
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (comments.prev_page_url) {
                    router.get(
                      comments.prev_page_url,
                      { search },
                      {
                        preserveState: true,
                        preserveScroll: true,
                      },
                    )
                  }
                }}
                disabled={!comments.prev_page_url}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                {comments.current_page} / {comments.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (comments.next_page_url) {
                    router.get(
                      comments.next_page_url,
                      { search },
                      {
                        preserveState: true,
                        preserveScroll: true,
                      },
                    )
                  }
                }}
                disabled={!comments.next_page_url}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
