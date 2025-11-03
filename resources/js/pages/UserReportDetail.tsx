"use client"

import type { BreadcrumbItem } from "@/types"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  ArrowLeft,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Flag,
  User,
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

interface UserReportDetailProps {
  report: Report
}

export default function UserReportDetail({ report }: UserReportDetailProps) {
  const [replyMessage, setReplyMessage] = useState("")
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
    {
      title: `Report #${report.id}`,
      href: `/my-reports/${report.id}`,
    },
  ]

  const handleSubmitReply = () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    setIsSubmittingReply(true)
    router.post(
      `/my-reports/${report.id}/reply`,
      { message: replyMessage },
      {
        onSuccess: () => {
          toast.success("Reply sent successfully")
          setReplyMessage("")
          router.reload()
        },
        onError: () => {
          toast.error("Failed to send reply")
        },
        onFinish: () => setIsSubmittingReply(false),
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

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.get("/my-reports")}
            className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Report Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Report #{report.id} • {getTimeAgo(report.created_at)}
            </p>
          </div>
        </div>

        {/* Report Card */}
        <Card className="dark:bg-black dark:border-gray-800 mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{report.subject}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
                  {getCategoryBadge(report.category)}
                  {(report.category === "user" || report.category === "abuse") && report.reported_user_name && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                      <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Reported: {report.reported_user_name}
                      </span>
                    </div>
                  )}
                    <div className="flex items-center gap-2 px-3 py-1 ">
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                    </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {/* Status Banner */}
        {report.status === "resolved" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-400">This report has been resolved</h3>
              <p className="text-sm text-green-700 dark:text-green-500">
                If you're still experiencing issues, you can add a reply below or create a new report.
              </p>
            </div>
          </div>
        )}

        {report.status === "closed" && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-300">This report has been closed</h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                This report is now closed. If you have a similar issue, please create a new report.
              </p>
            </div>
          </div>
        )}

        {/* Responses Section */}
        <Card className="dark:bg-black dark:border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="h-5 w-5" />
              Responses ({report.responses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.responses.length > 0 ? (
              <div className="space-y-6">
                {report.responses.map((response, index) => (
                  <div key={response.id}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {getAdminAvatar(response.admin_user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{response.admin_user.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getTimeAgo(response.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline" className="dark:border-gray-700">
                                {response.admin_user.role}
                          </Badge>
                        </div>
                        <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                          {response.message}
                        </p>
                      </div>
                    </div>
                    {index < report.responses.length - 1 && <Separator className="my-6 dark:bg-gray-800" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No responses yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Our team will respond to your report soon.</p>
              </div>
            )}
          </CardContent>

          {/* Add Reply */}
          {report.status !== "closed" && (
            <CardFooter className="border-t dark:border-gray-800 pt-4">
              <div className="w-full space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Add Reply</h3>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Add additional information to your report..."
                  rows={4}
                  className="resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmittingReply || !replyMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {isSubmittingReply ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
