"use client"

import type { BreadcrumbItem } from "@/types"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AlertTriangle,
  Calendar,
  ArrowLeft,
  Mail,
  Clock,
  User,
  MessageSquare,
  Send,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react"
import { useState } from "react"

interface I_User {
  id: number
  name: string
  email: string
  avatar?: string
  created_at: string
  reports_count?: number
  last_login?: string
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
  user: I_User
  responses: I_Response[]
  created_at: string
  updated_at: string
  resolved_at?: string
  assigned_to?: I_User
  reported_user_name?: string
}

interface ReportDetailProps {
  report: Report
}

export default function ReportDetail({ report }: ReportDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Reports",
      href: "/reports",
    },
    {
      title: `Report #${report.id}`,
      href: `/report/${report.id}`,
    },
  ]

  const handleStatusUpdate = (status: string) => {
    router.put(
      `/reports/${report.id}/status`,
      { status },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Status updated successfully"),
        onError: () => toast.error("Failed to update status"),
      },
    )
  }

  const handlePriorityUpdate = (priority: string) => {
    router.put(
      `/reports/${report.id}/priority`,
      { priority },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Priority updated successfully"),
        onError: () => toast.error("Failed to update priority"),
      },
    )
  }

  const handleDeleteReport = () => {
    router.delete(`/reports/${report.id}`, {
      onSuccess: () => {
        toast.success("Report deleted successfully")
        router.get("/reports")
      },
      onError: () => {
        toast.error("Failed to delete report")
      },
    })
    setDeleteDialogOpen(false)
  }

  const handleSubmitResponse = () => {
    if (!responseMessage.trim()) {
      toast.error("Please enter a response message")
      return
    }

    setIsSubmittingResponse(true)
    router.post(
      `/reports/${report.id}/responses`,
      { message: responseMessage },
      {
        onSuccess: () => {
          toast.success("Response sent successfully")
          setResponseMessage("")
          router.reload()
        },
        onError: () => {
          toast.error("Failed to send response")
        },
        onFinish: () => setIsSubmittingResponse(false),
      },
    )
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.className}`}>
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
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>{config.label}</span>
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title={`Report #${report.id} - ${report.subject}`} />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.get("/reports")}
            className="w-full sm:w-auto dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Report Details</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Report #{report.id} • {getTimeAgo(report.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Card */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                      {getUserAvatar(report.user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {report.user.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {report.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{report.subject}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(report.category)}
                    {(report.category === "user" || report.category === "abuse") && report.reported_user_name && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                        <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Reported User: {report.reported_user_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="dark:bg-gray-800" />

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{report.message}</p>
                </div>

                {/* Timestamps */}
                <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(report.created_at)}</span>
                  </div>
                  {report.updated_at !== report.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {formatDate(report.updated_at)}</span>
                    </div>
                  )}
                  {report.resolved_at && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Resolved: {formatDate(report.resolved_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Responses Section */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <MessageSquare className="h-5 w-5" />
                  Responses ({report.responses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.responses.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {report.responses.map((response, index) => (
                      <div key={response.id}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            {getAdminAvatar(response.admin_user)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
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
                        {index < report.responses.length - 1 && <Separator className="mt-4 dark:bg-gray-800" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 mb-6">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No responses yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Add a response to communicate with the user.
                    </p>
                  </div>
                )}

                {/* Add Response */}
                {report.status !== "closed" && (
                  <div className="space-y-3 pt-4 border-t dark:border-gray-800">
                    <Label htmlFor="response" className="text-sm font-medium text-gray-900 dark:text-white">
                      Add Response
                    </Label>
                    <Textarea
                      id="response"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Type your response to the user..."
                      rows={4}
                      className="resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitResponse}
                        disabled={isSubmittingResponse || !responseMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {isSubmittingResponse ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Response
                          </>
                        )}
                      </Button>
                    </div>
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
                    {getUserAvatar(report.user)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.user.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      {report.user.email}
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-800" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member since</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(report.user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {report.user.reports_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total reports</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.user.reports_count}
                      </span>
                    </div>
                  )}
                  {report.user.last_login && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last login</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getTimeAgo(report.user.last_login)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reported User Info (if applicable) */}
            {(report.category === "user" || report.category === "abuse") && report.reported_user_name && (
              <Card className="dark:bg-black dark:border-gray-800 border-orange-200 dark:border-orange-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-orange-800 dark:text-orange-300">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Reported User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {report.reported_user_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reported user</p>
                    </div>
                  </div>

                  <Separator className="dark:bg-gray-800" />

                  <div className="space-y-3">
                    <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-300">
                        <strong>Report Type:</strong> {report.category === "user" ? "User Behavior" : "Abuse Report"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(`/users?search=${report.reported_user_name}`)}
                        className="h-9 text-xs sm:text-sm dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Find User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(`/reports?search=${report.reported_user_name}`)}
                        className="h-9 text-xs sm:text-sm dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Other Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Management */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Report Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Status</Label>
                    <Select value={report.status} onValueChange={handleStatusUpdate}>
                      <SelectTrigger className="h-9 text-sm dark:bg-gray-900 dark:border-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Priority</Label>
                    <Select value={report.priority} onValueChange={handlePriorityUpdate}>
                      <SelectTrigger className="h-9 text-sm dark:bg-gray-900 dark:border-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:bg-black dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(`/user/${report.user.id}`)}
                  className="w-full h-9 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4 mr-2" />
                  View User Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(`/reports?search=${report.user.name}`)}
                  className="w-full h-9 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  User's Reports
                </Button>

                {/* Delete Report Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-9 text-sm dark:bg-red-900 dark:hover:bg-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-w-md dark:bg-black dark:border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg dark:text-white">Delete Report</DialogTitle>
                      <DialogDescription className="text-sm dark:text-gray-400">
                        Are you sure you want to delete this report from <strong>{report.user.name}</strong>? This
                        action cannot be undone and will also delete all {report.responses.length} responses.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Report Preview in Dialog */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg border dark:border-gray-800">
                      <div className="flex items-start gap-3 mb-2 sm:mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {getUserAvatar(report.user)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {report.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(report.created_at)}</p>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {report.subject}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{report.message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteReport}
                        className="w-full sm:w-auto dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
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
