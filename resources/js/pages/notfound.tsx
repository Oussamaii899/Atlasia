import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"

export default function NotFound() {
  
  return (
    <AppLayout>
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-100 p-6">
            <FileQuestion className="h-16 w-16 text-gray-500" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h1>

        <h2 className="text-xl font-semibold tracking-tight">Page not found</h2>

        <p className="text-gray-500">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex justify-center">
          <Button asChild>
            <a href="/">Return to home</a>
          </Button>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}
