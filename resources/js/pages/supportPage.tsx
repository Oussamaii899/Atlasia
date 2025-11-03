import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, MessageSquare, MapPin, Star, Smartphone, Globe, ExternalLink, Phone } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

export default function SupportPage() {
    const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support',
        href: '/support',
    }
];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title='Support' />
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Atlasia 2030 Support</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 ">Your guide to FIFA World Cup 2030 in Morocco</p>

          {/* Primary CTA */}
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg" asChild>
            <a href="my-reports/create" className="inline-flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Contact Support Team
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* Quick Help Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <MapPin className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Places & Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Find stadiums, hotels, restaurants & attractions</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <CardTitle className="text-lg">Reviews & Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Rate places, write reviews & interact with others</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <Smartphone className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">App Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Favorites, filters, offline maps & more</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <Globe className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Account Help</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Profile settings & account management</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Quick answers to common questions about Atlasia 2030</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I find FIFA World Cup stadiums and match venues?</AccordionTrigger>
                <AccordionContent>
                  Use the "Stadiums" category filter on the main screen or search for specific stadium names. Each
                  stadium includes match schedules, seating information, transportation options, and nearby amenities
                  like parking and restaurants.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do I save my favorite places and create a travel itinerary?</AccordionTrigger>
                <AccordionContent>
                  Tap the heart icon on any place to add it to your favorites. Access your saved places from the
                  "Favorites" tab in your profile. You can organize them by categories and create custom lists for
                  different days of your trip.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How can I write reviews and rate places I've visited?</AccordionTrigger>
                <AccordionContent>
                  After visiting a place, go to its detail page and tap "Write Review." You can rate from 1-5 stars, add
                  photos, and write detailed comments. Other users can like, reply to, or discuss your reviews to help
                  fellow travelers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I report incorrect information about a place?</AccordionTrigger>
                <AccordionContent>
                  On any place detail page, tap the three dots menu and select "Report Issue." You can report incorrect
                  hours, closed businesses, wrong locations, or outdated information. Our team reviews reports within 24
                  hours during the World Cup period.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">In-App Support Chat</CardTitle>
                  <CardDescription>Get instant help while using the app</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access live chat support directly from the app menu. Available 24/7 during FIFA World Cup 2030 with
                local Morocco tourism experts.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <a href="/chat/921">Open Chat Support</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Emergency Tourism Hotline</CardTitle>
                  <CardDescription>For urgent travel assistance in Morocco</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                24/7 emergency support for tourists during FIFA World Cup 2030. Get help with lost documents, medical
                emergencies, or urgent travel issues.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:+212-800-Atlasia" className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +212 800 Atlasia (72327)
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Support */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Technical Support
            </CardTitle>
            <CardDescription>App issues, bugs, and technical problems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Common Technical Issues:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• App crashes or freezing</li>
                  <li>• Map not loading or GPS issues</li>
                  <li>• Photos not uploading in reviews</li>
                  <li>• Login or account sync problems</li>
                  <li>• Offline maps not downloading</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Before Contacting Support:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Update to the latest app version</li>
                  <li>• Check your internet connection</li>
                  <li>• Restart the app</li>
                  <li>• Clear app cache (Android)</li>
                  <li>• Ensure location permissions are enabled</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3 dark:text-black">Enjoy FIFA World Cup 2030 in Morocco!</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to ensure you have the best experience exploring Morocco during the tournament
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <a href="/my-reports" className="inline-flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Get Help Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}
