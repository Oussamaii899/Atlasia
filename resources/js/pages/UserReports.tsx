"use client"

import type React from "react"

import type { BreadcrumbItem } from "@/types"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Calendar,
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Flag,
} from "lucide-react"
import { useState } from "react"

interface I_User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface I_Response {
  id: number
  message: string
  admin_user: I_User
  created_at: string
  updated_at: string
}

interface Report {
  id: number
  subject: string
  category: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  responses: I_Response[]
  created_at: string
  updated_at: string
  resolved_at?: string
  reported_user_name?: string
}

interface UserReportsProps {
  reports: {
    data: Report[]
    total: number
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
  }
  filters: {
    search?: string
    status?: string
    category?: string
  }
}

export default function UserReports({ reports, filters }: UserReportsProps) {
  const [search, setSearch] = useState(filters.search || "")
  const [statusFilter, setStatusFilter] = useState(filters.status || "all")
  const [categoryFilter, setCategoryFilter] = useState(filters.category || "all")
  const [replyMessage, setReplyMessage] = useState("")
  const [replyingToId, setReplyingToId] = useState<number | null>(null)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Support",
      href: "/support",
    },
    {
      title: "My Reports",
      href: "/my-reports",
    },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    router.get(
      "/my-reports",
      {
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const handleSubmitReply = (reportId: number) => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    setIsSubmittingReply(true)
    router.post(
      `/my-reports/${reportId}/reply`,
      { message: replyMessage },
      {
        onSuccess: () => {
          toast.success("Reply sent successfully")
          setReplyMessage("")
          setReplyingToId(null)
        },
        onError: () => {
          toast.error("Failed to send reply")
        },
        onFinish: () => setIsSubmittingReply(false),
      },
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  const getAdminAvatar = (user: I_User) => {
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
      <div className="w-full h-full bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-medium text-xs">
        {initials}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: "destructive" as const, label: "Open", icon: AlertCircle },
      in_progress: { variant: "default" as const, label: "In Progress", icon: Loader },
      resolved: { variant: "secondary" as const, label: "Resolved", icon: CheckCircle },
      closed: { variant: "outline" as const, label: "Closed", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 dark:bg-gray-800">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400", label: "Low" },
      medium: {
        className: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400",
        label: "Medium",
      },
      high: { className: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400", label: "High" },
      urgent: { className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400", label: "Urgent" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.className}`}>
        <Flag className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      bug: { className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400", label: "Bug Report" },
      feature: {
        className: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400",
        label: "Feature Request",
      },
      support: {
        className: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-400",
        label: "Support",
      },
      abuse: { className: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400", label: "Abuse" },
      other: { className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400", label: "Other" },
    }

    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title="My Reports" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your support tickets and reports</p>
          </div>
          <Button
            onClick={() => router.get("/my-reports/create")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black p-4 rounded-lg border dark:border-gray-800 shadow-sm space-y-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="pl-10 w-full dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-gray-900 dark:border-gray-800">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-gray-900 dark:border-gray-800">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="abuse">Abuse Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="submit"
                variant="outline"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
              >
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.data.length > 0 ? (
            reports.data.map((report) => (
              <Card key={report.id} className="dark:bg-black dark:border-gray-800 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        onClick={() => router.get(`/my-reports/${report.id}`)}
                      >
                        {report.subject}
                      </h3>
                      {getCategoryBadge(report.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(report.priority)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {formatDate(report.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{report.responses.length} responses</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="responses">Responses ({report.responses.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                          {report.message}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="responses">
                      {report.responses.length > 0 ? (
                        <div className="space-y-4">
                          {report.responses.map((response) => (
                            <div key={response.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                {getAdminAvatar(response.admin_user)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                      {response.admin_user.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {getTimeAgo(response.created_at)}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs dark:border-gray-700">
                                {response.admin_user.role}
                                    
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                                  {response.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No responses yet</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Our team will respond to your report soon.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>

                {report.status !== "closed" && (
                  <CardFooter className="border-t dark:border-gray-800 pt-4">
                    {replyingToId === report.id ? (
                      <div className="w-full space-y-3">
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Add additional information to your report..."
                          rows={3}
                          className="resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingToId(null)
                              setReplyMessage("")
                            }}
                            className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(report.id)}
                            disabled={isSubmittingReply || !replyMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            {isSubmittingReply ? (
                              <>
                                <Loader className="h-3 w-3 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-2" />
                                Send Reply
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingToId(report.id)}
                        className="w-full dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Reply
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-black rounded-lg border dark:border-gray-800 shadow-sm">
              <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
                <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                <p className="text-lg font-medium">No reports found</p>
                <p className="text-sm">You haven't submitted any reports yet.</p>
                <Button
                  onClick={() => router.get("/my-reports/create")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reports.data.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {reports.data.length} of {reports.total} reports
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (reports.prev_page_url) {
                    router.get(reports.prev_page_url, {
                      search,
                      status: statusFilter !== "all" ? statusFilter : undefined,
                      category: categoryFilter !== "all" ? categoryFilter : undefined,
                    })
                  }
                }}
                disabled={!reports.prev_page_url}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                {reports.current_page} / {reports.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (reports.next_page_url) {
                    router.get(reports.next_page_url, {
                      search,
                      status: statusFilter !== "all" ? statusFilter : undefined,
                      category: categoryFilter !== "all" ? categoryFilter : undefined,
                    })
                  }
                }}
                disabled={!reports.next_page_url}
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
