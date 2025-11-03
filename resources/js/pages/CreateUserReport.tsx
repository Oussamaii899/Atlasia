"use client"

import type React from "react"

import type { BreadcrumbItem } from "@/types"
import { Head, router, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, ArrowLeft, Send, Info, User } from "lucide-react"
import { useState } from "react"

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
    title: "Create Report",
    href: "/my-reports/create",
  },
]

interface FormData {
  subject: string
  category: string
  message: string
  priority: string
  reported_user_name?: string
}

export default function CreateUserReport() {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    subject: "",
    category: "",
    message: "",
    priority: "medium",
    reported_user_name: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    post(route("user.reports.store"), {
      onSuccess: () => {
        toast.success("Report submitted successfully")
        reset()
      },
      onError: (errors) => {
        toast.error("Please check the form for errors")
        console.error("Form errors:", errors)
      },
      onFinish: () => setIsSubmitting(false),
    })
  }

  const categoryOptions = [
    { value: "bug", label: "Bug Report", description: "Report a technical issue or error" },
    { value: "feature", label: "Feature Request", description: "Suggest a new feature or improvement" },
    { value: "support", label: "Support", description: "Get help with using the platform" },
    { value: "user", label: "User Report", description: "Report inappropriate user behavior or content" },
    { value: "abuse", label: "Abuse Report", description: "Report harassment, spam, or violations" },
    { value: "other", label: "Other", description: "General inquiries or other issues" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low", description: "Minor issue, no urgency" },
    { value: "medium", label: "Medium", description: "Standard priority" },
    { value: "high", label: "High", description: "Important issue affecting functionality" },
    { value: "urgent", label: "Urgent", description: "Critical issue requiring immediate attention" },
  ]

  const getCategoryDescription = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category)
    return option?.description || ""
  }

  const getPriorityDescription = (priority: string) => {
    const option = priorityOptions.find((opt) => opt.value === priority)
    return option?.description || ""
  }

  const showUserNameField = data.category === "user" || data.category === "abuse"

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-right" richColors />
      <Head title="Create New Report" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 lg:mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.get("/my-reports")}
              className="w-fit dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Create New Report
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Submit a report to get help from our support team
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Before submitting a report</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Check our FAQ or documentation for common solutions</li>
                      <li>• Provide as much detail as possible to help us understand the issue</li>
                      <li>• Include steps to reproduce the problem if applicable</li>
                      <li>• Our team typically responds within 24-48 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <Card className="dark:bg-black dark:border-gray-800">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg sm:text-xl">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                    Report Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-900 dark:text-white">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={data.subject}
                        onChange={(e) => setData("subject", e.target.value)}
                        placeholder="Brief description of your issue"
                        className={`dark:bg-gray-900 dark:border-gray-800 dark:text-white ${
                          errors.subject ? "border-red-500 dark:border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.subject && <p className="text-sm text-red-600 dark:text-red-400">{errors.subject}</p>}
                    </div>

                    {/* Category and Priority Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-white">
                          Category *
                        </Label>
                        <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                          <SelectTrigger
                            className={`dark:bg-gray-900 dark:border-gray-800 ${
                              errors.category ? "border-red-500 dark:border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="py-1">
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                    {option.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {data.category && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {getCategoryDescription(data.category)}
                          </p>
                        )}
                        {errors.category && <p className="text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                      </div>

                      {/* Priority */}
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium text-gray-900 dark:text-white">
                          Priority
                        </Label>
                        <Select value={data.priority} onValueChange={(value) => setData("priority", value)}>
                          <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800">
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="py-1">
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                    {option.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {data.priority && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {getPriorityDescription(data.priority)}
                          </p>
                        )}
                        {errors.priority && <p className="text-sm text-red-600 dark:text-red-400">{errors.priority}</p>}
                      </div>
                    </div>

                    {/* User Name Field (conditional) */}
                    {showUserNameField && (
                      <div className="space-y-2 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <Label
                            htmlFor="reported_user_name"
                            className="text-sm font-medium text-orange-800 dark:text-orange-300"
                          >
                            User Name {data.category === "user" ? "*" : "(Optional)"}
                          </Label>
                        </div>
                        <Input
                          id="reported_user_name"
                          type="text"
                          value={data.reported_user_name || ""}
                          onChange={(e) => setData("reported_user_name", e.target.value)}
                          placeholder="Enter the username or display name of the user you're reporting"
                          className={`dark:bg-gray-900 dark:border-gray-700 dark:text-white ${
                            errors.reported_user_name ? "border-red-500 dark:border-red-500" : ""
                          }`}
                          required={data.category === "user"}
                        />
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          {data.category === "user"
                            ? "Please provide the exact username or display name of the user you're reporting."
                            : "If your report involves a specific user, please provide their username or display name."}
                        </p>
                        {errors.reported_user_name && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.reported_user_name}</p>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-white">
                        Detailed Description *
                      </Label>
                      <Textarea
                        id="message"
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        placeholder={
                          showUserNameField
                            ? `Please provide a detailed description of the user's behavior or content that violates our community guidelines. Include:
• What the user did that was inappropriate
• When and where this occurred
• Any relevant context or screenshots
• How this affected you or others`
                            : `Please provide a detailed description of your issue. Include:
• What you were trying to do
• What happened instead
• Steps to reproduce the problem
• Any error messages you received
• Your browser/device information (if relevant)`
                        }
                        rows={8}
                        className={`resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-white ${
                          errors.message ? "border-red-500 dark:border-red-500" : ""
                        }`}
                        required
                      />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          {errors.message && <p className="text-sm text-red-600 dark:text-red-400">{errors.message}</p>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                          {data.message.length}/5000 characters
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t dark:border-gray-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get("/my-reports")}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto dark:bg-gray-900 dark:text-white dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || processing}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {isSubmitting || processing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Report
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Guidelines Card */}
              <Card className="dark:bg-black dark:border-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Submission Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Be respectful and professional in your communication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Provide accurate and truthful information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Do not include sensitive personal information (passwords, payment details)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>One issue per report - submit separate reports for different problems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>You will receive email notifications when we respond to your report</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Category-specific Guidelines */}
              {showUserNameField && (
                <Card className="dark:bg-black dark:border-gray-800 border-orange-200 dark:border-orange-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-orange-800 dark:text-orange-300 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Report Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                      <p className="font-medium">When reporting a user, please include:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Specific examples of inappropriate behavior</li>
                        <li>• Screenshots or evidence (if available)</li>
                        <li>• Date and time of incidents</li>
                        <li>• Context of the interaction</li>
                        <li>• How it violates our community guidelines</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <p className="text-xs text-orange-800 dark:text-orange-300">
                        <strong>Note:</strong> False reports may result in action against your account. Please ensure
                        your report is accurate and made in good faith.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Response Time Card */}
              <Card className="dark:bg-black dark:border-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Response Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Low Priority:</span>
                      <span className="text-gray-900 dark:text-white font-medium">3-5 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Medium Priority:</span>
                      <span className="text-gray-900 dark:text-white font-medium">1-2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">High Priority:</span>
                      <span className="text-gray-900 dark:text-white font-medium">4-8 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Urgent:</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">1-2 hours</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Response times may vary during weekends and holidays.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="dark:bg-black dark:border-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Need Immediate Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For urgent issues that require immediate attention:
                  </p>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@Atlasia.com"
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      📧 support@Atlasia.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
