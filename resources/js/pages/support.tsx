"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, User } from "lucide-react"
import appLayout from "@/layouts/app-layout"
import { AppContent } from "@/components/app-content"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

type FormData = {
  subject: string
  category: string
  username?: string
  message: string
}

type FormErrors = {
  [K in keyof FormData]?: string
}

export default function Support() {
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    category: "",
    username: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear username when category changes away from "report user"
      ...(name === "category" && value !== "report user" && { username: "" }),
    }))

    // Clear error when user selects a value
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters."
    }

    if (!formData.category) {
      newErrors.category = "Please select a category."
    }

    // Validate username only if "report user" is selected
    if (formData.category === "report user") {
      if (!formData.username || formData.username.trim().length < 2) {
        newErrors.username = "Username is required and must be at least 2 characters."
      }
    }

    if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submit clicked")

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare form data, excluding username if not reporting a user
      const submitData = {
        ...formData,
        ...(formData.category !== "report user" && { username: undefined }),
      }

      const response = await fetch("/supportStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit support request")
      }

      const result = await response.json()

      // Reset form
      setFormData({
        subject: "",
        category: "",
        username: "",
        message: "",
      })

      setSubmitStatus({
        type: "success",
        message: `Ticket ID: ${result.ticketId}. We'll respond within 24 hours.`,
      })
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit support request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReportUser = formData.category === "report user"

  return (
    <AppLayout breadcrumbs={[{ title: "Support", href: "/support" }]}>
      <Head title="Support"/>
    <div className="flex justify-center items-start min-h-screen pt-12 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Submit Support Ticket
          </CardTitle>
          <CardDescription>
            Need help? Fill out this form and our support team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus && (
            <Alert className={`mb-6 ${submitStatus.type === "success" ? "border-green-500" : "border-red-500"}`}>
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={submitStatus.type === "success" ? "text-green-700" : "text-red-700"}>
                {submitStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                name="category"
              >
                <SelectTrigger className={errors.category ? "border-red-500 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account issues">Account Issues</SelectItem>
                  <SelectItem value="report user">Report User</SelectItem>
                  <SelectItem value="feature request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Conditional Username Field */}
            {isReportUser && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username to Report *
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter the username you want to report"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Please provide the exact username of the user you wish to report.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">
                Message *
                {isReportUser && (
                  <span className="text-muted-foreground font-normal"> (Please describe the issue with this user)</span>
                )}
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder={
                  isReportUser
                    ? "Please describe the user's behavior that violates our terms of service. Include specific details, dates, and any evidence you may have."
                    : "Please describe your issue in detail. Include any error messages, steps to reproduce the problem, and any other relevant information."
                }
                value={formData.message}
                onChange={handleInputChange}
                className={`min-h-[120px] resize-none ${errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.message && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                The more details you provide, the better we can assist you.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Support Ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
