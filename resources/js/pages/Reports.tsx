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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Calendar, Clock, Filter, Search, User, Trash2 } from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Reports",
    href: "/reports",
  },
]

interface Report {
  id: number
  subject: string
  category: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
    avatar?: string
  }
  reported_user_name?: string
}

interface ReportsData {
  data: Report[]
  prev_page_url: string | null
  next_page_url: string | null
  current_page: number
  last_page: number
  total: number
}

export default function Reports({ reports }: { reports: ReportsData }) {
  const { data } = reports
  const [selectedRows, setSelectedRows] = useState(new Set<number>())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const { filters } = usePage().props as { filters: { search?: string; status?: string; category?: string } }
  const [search, setSearch] = useState(filters.search || "")

  const handleDelete = (id: number) => {
    router.delete(`/reports/${id}`, {
      onSuccess: () => {
        toast.success("Report deleted successfully")
        router.reload()
      },
      onError: () => {
        toast.error("Failed to delete report")
        console.error("Failed to delete report")
      },
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      "/reports",
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

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        "/reports",
        {
          search,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        },
      )
    }, 500)

    return () => clearTimeout(timeout)
  }, [search, statusFilter, categoryFilter])

  const handleRowSelect = (reportId: number) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (newSelected.has(reportId)) {
        newSelected.delete(reportId)
      } else {
        newSelected.add(reportId)
      }
      return newSelected
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((report) => report.id)))
    }
  }

  const handleBulkDelete = () => {
    router.post(
      "/reports/bulk-delete",
      {
        ids: Array.from(selectedRows),
      },
      {
        onSuccess: () => {
          toast.success("Selected reports deleted")
          setSelectedRows(new Set())
          router.reload()
        },
        onError: () => toast.error("Failed to delete selected reports"),
      },
    )
  }

  const handleStatusUpdate = (id: number, status: string) => {
    router.put(
      `/reports/${id}/status`,
      { status },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Status updated successfully"),
        onError: () => toast.error("Failed to update status"),
      },
    )
  }

  const truncateMessage = (text: string, maxLength = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const getUserAvatar = (user: Report["user"], size: "sm" | "md" = "md") => {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: "destructive" as const, label: "Open" },
      in_progress: { variant: "default" as const, label: "In Progress" },
      resolved: { variant: "secondary" as const, label: "Resolved" },
      closed: { variant: "outline" as const, label: "Closed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return (
      <Badge variant={config.variant} className="dark:bg-gray-800">
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string, compact = false) => {
    const priorityConfig = {
      low: {
        className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400",
        label: compact ? "L" : "Low",
      },
      medium: {
        className: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400",
        label: compact ? "M" : "Medium",
      },
      high: {
        className: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400",
        label: compact ? "H" : "High",
      },
      urgent: {
        className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400",
        label: compact ? "U" : "Urgent",
      },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    const sizeClass = compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs"
    return <span className={`${sizeClass} rounded-full font-medium ${config.className}`}>{config.label}</span>
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title="Reports Management" />

      {/* Header Section */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              Manage and resolve user reports and support tickets
            </p>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-black p-4 rounded-lg border dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports, subjects, users..."
                  className="pl-10 w-full sm:w-80 dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </form>

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
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">{selectedRows.size} selected</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                  >
                    Delete ({selectedRows.size})
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 dark:bg-black dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Delete Selected Reports</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      Are you sure you want to delete {selectedRows.size} selected reports? This action cannot be
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

      {/* Reports Table */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white dark:bg-black rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Mobile View */}
          <div className="block sm:hidden">
            {data.length ? (
              <div className="divide-y dark:divide-gray-800">
                {data.map((report) => (
                  <div key={report.id} className="p-3 space-y-3">
                    {/* User Info and Checkbox Row */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedRows.has(report.id)}
                        onCheckedChange={() => handleRowSelect(report.id)}
                        className="dark:border-gray-700 dark:data-[state=checked]:bg-blue-600 flex-shrink-0"
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getUserAvatar(report.user, "sm")}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs text-gray-900 dark:text-white truncate">
                            {report.user.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{report.user.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Subject and Message */}
                    <div className="space-y-2">
                      <h3
                        className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                        onClick={() => router.get(`/report/${report.id}`)}
                      >
                        {report.subject}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {truncateMessage(report.message, 80)}
                      </p>
                    </div>

                    {/* Category and Reported User */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {report.category}
                      </span>
                      {(report.category === "user" || report.category === "abuse") && report.reported_user_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-700 dark:text-orange-400 font-medium truncate max-w-24">
                            {report.reported_user_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Controls Row - Status, Priority, Time, Delete */}
                    <div className="space-y-2">
                      {/* First row: Status and Priority */}
                      <div className="flex items-center gap-2">
                        <Select value={report.status} onValueChange={(value) => handleStatusUpdate(report.id, value)}>
                          <SelectTrigger className="h-7 text-xs flex-1 min-w-0 dark:bg-gray-900 dark:border-gray-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                            <SelectItem value="open" className="text-xs">
                              Open
                            </SelectItem>
                            <SelectItem value="in_progress" className="text-xs">
                              Progress
                            </SelectItem>
                            <SelectItem value="resolved" className="text-xs">
                              Resolved
                            </SelectItem>
                            <SelectItem value="closed" className="text-xs">
                              Closed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-shrink-0">{getPriorityBadge(report.priority, true)}</div>
                      </div>

                      {/* Second row: Time and Delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{getTimeAgo(report.created_at)}</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs flex-shrink-0 dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="mx-4 max-w-sm dark:bg-black dark:border-gray-800">
                            <DialogHeader>
                              <DialogTitle className="text-base dark:text-white">Delete Report</DialogTitle>
                              <DialogDescription className="text-sm dark:text-gray-400">
                                Delete report from {report.user.name}? This cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 mt-4">
                              <DialogClose asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(report.id)}
                                className="dark:bg-red-900 dark:text-white dark:border-red-800 dark:hover:bg-red-800"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
                  <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-medium">No reports found</p>
                  <p className="text-sm">Reports will appear here when users submit support tickets.</p>
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
                  <TableHead className="w-68 dark:text-gray-400">User</TableHead>
                  <TableHead className="min-w-80 dark:text-gray-400">Subject & Message</TableHead>
                  <TableHead className="w-32 dark:text-gray-400">Category</TableHead>
                  <TableHead className="w-40 dark:text-gray-400">Reported User</TableHead>
                  <TableHead className="w-24 dark:text-gray-400">Priority</TableHead>
                  <TableHead className="w-32 dark:text-gray-400">Status</TableHead>
                  <TableHead className="w-32 dark:text-gray-400">Created</TableHead>
                  <TableHead className="w-24 dark:text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length ? (
                  data.map((report) => (
                    <TableRow
                      key={report.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900 border-b dark:border-gray-800 ${selectedRows.has(report.id) ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(report.id)}
                          onCheckedChange={() => handleRowSelect(report.id)}
                          className="dark:border-gray-700 dark:data-[state=checked]:bg-blue-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getUserAvatar(report.user)}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{report.user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{report.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <h3
                            className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1"
                            onClick={() => router.get(`/report/${report.id}`)}
                          >
                            {report.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {truncateMessage(report.message)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded capitalize">
                          {report.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(report.category === "user" || report.category === "abuse") && report.reported_user_name ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                              {report.reported_user_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-600">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>
                        <Select value={report.status} onValueChange={(value) => handleStatusUpdate(report.id, value)}>
                          <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {getTimeAgo(report.created_at)}
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
                              <DialogTitle className="dark:text-white">Delete Report</DialogTitle>
                              <DialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete this report from {report.user.name}? This action cannot
                                be undone.
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
                                onClick={() => handleDelete(report.id)}
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
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
                        <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                        <p className="text-lg font-medium">No reports found</p>
                        <p className="text-sm">Reports will appear here when users submit support tickets.</p>
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
              Showing {data.length} of {reports.total} reports
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (reports.prev_page_url) {
                    router.get(
                      reports.prev_page_url,
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
                    router.get(
                      reports.next_page_url,
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
