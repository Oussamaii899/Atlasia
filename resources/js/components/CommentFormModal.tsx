"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Comment {
  id: number
  author_name: string
  author_email: string
  content: string
  post_title?: string
  status: "pending" | "approved" | "rejected"
  is_published: boolean
  created_at: string
  updated_at: string
}

interface CommentFormModalProps {
  isOpen: boolean
  closeModal: () => void
  comment: Comment | null
}

export default function CommentFormModal({ isOpen, closeModal, comment }: CommentFormModalProps) {
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: "",
    status: "pending" as "pending" | "approved" | "rejected",
    is_published: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (comment) {
      setFormData({
        author_name: comment.author_name,
        author_email: comment.author_email,
        content: comment.content,
        status: comment.status,
        is_published: comment.is_published,
      })
    } else {
      setFormData({
        author_name: "",
        author_email: "",
        content: "",
        status: "pending",
        is_published: false,
      })
    }
  }, [comment, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const url = comment ? `/comments/${comment.id}` : "/comments"
    const method = comment ? "put" : "post"

    router[method](url, formData, {
      onSuccess: () => {
        toast.success(comment ? "Comment updated successfully" : "Comment created successfully")
        closeModal()
        router.reload()
      },
      onError: (errors) => {
        toast.error("Failed to save comment")
        console.error("Form errors:", errors)
      },
      onFinish: () => setIsSubmitting(false),
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{comment ? "Edit Comment" : "Add New Comment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name *</Label>
              <Input
                id="author_name"
                type="text"
                value={formData.author_name}
                onChange={(e) => handleInputChange("author_name", e.target.value)}
                placeholder="Enter author name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_email">Author Email *</Label>
              <Input
                id="author_email"
                type="email"
                value={formData.author_email}
                onChange={(e) => handleInputChange("author_email", e.target.value)}
                placeholder="Enter author email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Comment Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Enter comment content"
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_published">Published</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                />
                <span className="text-sm text-gray-600">{formData.is_published ? "Published" : "Draft"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving..." : comment ? "Update Comment" : "Create Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
