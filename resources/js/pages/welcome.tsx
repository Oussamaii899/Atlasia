"use client"
import React from "react"
import {
  ArrowRight,
  ArrowUp,
  Building2,
  MapPin,
  Search,
  Star,
  Utensils,
  Users,
  Award,
  Globe,
  Quote,
  Mail,
  Heart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Head, Link } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      size="icon"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}

// Stats Section Component
function StatsSection() {
  const stats = [
    {
      icon: Globe,
      number: "6",
      label: "Host Cities",
      description: "Across Morocco",
    },
    {
      icon: MapPin,
      number: "1000+",
      label: "Locations",
      description: "Curated for you",
    },
    {
      icon: Users,
      number: "50K+",
      label: "Travelers",
      description: "Trust Atlasia",
    },
    {
      icon: Award,
      number: "4.9",
      label: "Rating",
      description: "User satisfaction",
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function NewsletterSection() {
  const { auth } = usePage().props;
    const [email, setEmail] = useState('');

  const handleRedirect = () => {
    router.visit(`/login?email=${encodeURIComponent(email)}`);
  };

  // Don't show this section if the user is logged in
  if (auth?.user) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Stay Updated</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Never Miss an Update</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Get exclusive travel tips, early access to new features, and special offers for World Cup 2030 in Morocco.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-12 py-4 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white/40"
                />
              </div>
              <Button onClick={handleRedirect} className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-4 rounded-xl">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-4">Join 10,000+ travelers. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Cities Component
function FeaturedCities() {
  const cities = [
    {
      name: "Casablanca",
      image: "https://www.bing.com/th/id/OIP.R2xW3vjuLB1ZCf8Uit-yRgHaEq?w=245&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "Morocco's economic powerhouse with stunning Art Deco architecture",
      stadiums: 2,
      highlights: ["Hassan II Mosque", "Corniche", "Old Medina"],
      rating: 4.8,
    },
    {
      name: "Marrakech",
      image: "https://www.bing.com/th/id/OIP.fld1rJIICSxiXopOYDS3xgHaE8?w=245&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "The Red City where ancient traditions meet modern luxury",
      stadiums: 2,
      highlights: ["Jemaa el-Fnaa", "Majorelle Garden", "Bahia Palace"],
      rating: 4.9,
    },
    {
      name: "Rabat",
      image: "https://www.bing.com/th/id/OIP.jsXE3Z6hFRQpjZYgKEEDcAHaE8?w=245&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "The capital city blending imperial history with coastal charm",
      stadiums: 2,
      highlights: ["Royal Palace", "Kasbah of the Udayas", "Hassan Tower"],
      rating: 4.7,
    },
    {
      name: "Tangier",
      image: "https://www.bing.com/th/id/OIP.9bAqTQUUAgnSr6eLqNVJWAHaE8?w=239&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "Gateway between Africa and Europe with Mediterranean flair",
      stadiums: 2,
      highlights: ["Cap Spartel", "Caves of Hercules", "Kasbah Museum"],
      rating: 4.6,
    },
    {
      name: "Fez",
      image: "https://www.bing.com/th/id/OIP.NTChGXW-NGKN4jKkaJ44ugHaFc?w=235&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "Ancient imperial city home to the world's oldest university",
      stadiums: 2,
      highlights: ["Fez el-Bali", "Al-Qarawiyyin", "Bou Inania Madrasa"],
      rating: 4.8,
    },
    {
      name: "Agadir",
      image: "https://www.bing.com/th/id/OIP.l9uLp8m1AYM83H-fP3R2hwHaE8?w=244&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      description: "Modern beach resort city with year-round sunshine",
      stadiums: 2,
      highlights: ["Agadir Beach", "Souk El Had", "Paradise Valley"],
      rating: 4.5,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cities.map((city) => (
        <Card
          key={city.name}
          className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg"
        >
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={city.image || "/placeholder.svg"}
                alt={city.name}
                width={700}
                height={500}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute top-4 right-4">
                <Badge className="bg-white/90 text-gray-900">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {city.rating}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">{city.name}</h3>
                <p className="text-white/90 mb-4 text-sm leading-relaxed">{city.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {city.highlights.slice(0, 2).map((highlight, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{city.stadiums} World Cup Stadiums</span>
                  </div>
                  <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Link href={`/posts?city=${encodeURIComponent(city.name)}`}>
                        Explore
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Testimonials Component
function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "United States",
      avatar: "https://th.bing.com/th/id/R.36a637acd327c76357628dca25f838de?rik=KEv28AfFiyqYjA&pid=ImgRaw&r=0",
      content:
        "Atlasia Morocco made our trip absolutely magical! The recommendations were spot-on, and the cultural experiences were authentic and unforgettable. Can't wait to return for the World Cup!",
      rating: 5,
      trip: "Cultural Tour • 10 days",
    },
    {
      name: "Carlos Mendez",
      location: "Spain",
      avatar: "https://m.media-amazon.com/images/S/amzn-author-media-prod/is5hkllsl8dmsu91mo4bp7mvh0.jpg",
      content:
        "The hospitality in Morocco exceeded all expectations. From luxury riads in Marrakech to beachfront hotels in Agadir, every recommendation was perfect. The perfect World Cup destination!",
      rating: 5,
      trip: "Luxury Experience • 7 days",
    },
    {
      name: "Aisha Patel",
      location: "United Kingdom",
      avatar: "data:image/webp;base64,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",
      content:
        "The blend of ancient traditions and modern comfort in Morocco is incredible. The medinas, the food, the people - everything was extraordinary. Atlasia's guidance was invaluable.",
      rating: 5,
      trip: "Family Adventure • 14 days",
    },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      {testimonials.map((testimonial, i) => (
        <Card
          key={i}
          className="relative bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <CardContent className="p-8">
            <Quote className="h-8 w-8 text-red-600 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">"{testimonial.content}"</p>

            <div className="flex items-center gap-4">
              <img
                src={testimonial.avatar || "/placeholder.svg"}
                alt={testimonial.name}
                width={60}
                height={60}
                className="rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.location}</p>
                <p className="text-xs text-red-600 font-medium mt-1">{testimonial.trip}</p>
              </div>
            </div>

            <div className="flex mt-4">
              {Array(5)
                .fill(0)
                .map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${j < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    }
];
// Main Page Component
export default function Home() {
  const [searchText, setSearchText] = React.useState('');

  return (
    <AppLayout  breadcrumbs={breadcrumbs}>
    <Head title="Home" />
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section with Enhanced Design */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/95 via-red-800/90 to-orange-900/95 z-10" />
        <div className="absolute inset-0">
          <img
            src="/images/morocco-landscape-hero.jpg"
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Moroccan Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="w-full h-full bg-[url('/images/moroccan-pattern.png')] bg-repeat"></div>
        </div>

        <div className="relative z-20 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-600/20 text-green-300 border-green-500/30 px-4 py-2 text-sm font-medium">
              FIFA World Cup 2030 Official Travel Partner
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
              Experience
              <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Morocco
              </span>
              <span className="text-4xl md:text-5xl lg:text-6xl block mt-2">Like Never Before</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover the magic of Morocco during the 2030 FIFA World Cup. From ancient medinas to world-class
              stadiums, create unforgettable memories in the Kingdom of Morocco.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              onClick={() => router.visit('/posts')}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">6</div>
                <div className="text-white/80 text-sm">Host Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">12</div>
                <div className="text-white/80 text-sm">Stadiums</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">1000+</div>
                <div className="text-white/80 text-sm">Experiences</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/80 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>
      </section>

      {/* Enhanced Search Section */}
      <section className="py-16 -mt-16 relative z-30">
        <div className="container mx-auto px-4 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Find Your Perfect Experience
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Discover stadiums, luxury hotels, authentic restaurants, and cultural treasures
                </p>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <Input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for stadiums, hotels, restaurants, or attractions..."
                  className="pl-16 pr-32 py-6 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400"
                />
                <Button
                  onClick={() => router.visit('/posts', { data: { search: searchText }, method: 'get' })}
                  className="absolute right-2 top-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-3"
                >
                  Search
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  {
                    icon: MapPin,
                    label: "Stadium",
                    color:
                      "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40",
                  },
                  {
                    icon: Building2,
                    label: "Hotel",
                    color:
                      "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40",
                  },
                  {
                    icon: Utensils,
                    label: "Restaurant",
                    color:
                      "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40",
                  },
                  {
                    icon: Star,
                    label: "Shopping",
                    color:
                      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800/40",
                  },
                  {
                    icon: Heart,
                    label: "Healthcare",
                    color:
                      "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40",
                  },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={`/posts?category=${encodeURIComponent(item.label)}`}
                    className={`rounded-full px-6 py-3 ${item.color} transition-all duration-200 flex items-center`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Cities with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">World Cup Host Cities</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Explore Morocco's Jewels
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From the bustling streets of Casablanca to the ancient medinas of Fez, discover the cities that will host
              the world's greatest football celebration.
            </p>
          </div>
          <FeaturedCities />
        </div>
      </section>


      {/* Cultural Experiences with Premium Design */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[url('/images/moroccan-pattern-bg.png')] bg-repeat"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Authentic Morocco</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Immerse in Rich Culture</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Beyond football, discover the soul of Morocco through authentic experiences that have been cherished for
              centuries.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[
              {
                title: "Royal Hammam Experience",
                description: "Indulge in traditional Moroccan spa rituals with aromatic oils and ancient techniques",
                icon: "🛁",
                price: "From $45",
                duration: "2-3 hours",
              },
              {
                title: "Medina Discovery Tours",
                description: "Navigate ancient labyrinths with expert guides revealing hidden stories and secrets",
                icon: "🏛️",
                price: "From $25",
                duration: "Half day",
              },
              {
                title: "Culinary Masterclasses",
                description: "Master the art of tagine, couscous, and pastries with renowned Moroccan chefs",
                icon: "👨‍🍳",
                price: "From $65",
                duration: "4 hours",
              },
              {
                title: "Sahara Desert Adventures",
                description: "Experience camel trekking, stargazing, and luxury desert camps under infinite skies",
                icon: "🐪",
                price: "From $150",
                duration: "2-3 days",
              },
              {
                title: "Artisan Workshops",
                description: "Learn traditional crafts from master artisans creating pottery, textiles, and jewelry",
                icon: "🎨",
                price: "From $35",
                duration: "3 hours",
              },
              {
                title: "Music & Dance Nights",
                description: "Enjoy mesmerizing Gnawa music and traditional folk performances in authentic venues",
                icon: "🎵",
                price: "From $20",
                duration: "Evening",
              },
            ].map((experience, i) => (
              <Card
                key={i}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {experience.icon}
                  </div>
                  <CardTitle className="text-white text-xl mb-2">{experience.title}</CardTitle>
                  <div className="flex justify-center gap-4 text-sm text-white/80">
                    <span>{experience.price}</span>
                    <span>•</span>
                    <span>{experience.duration}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 text-center leading-relaxed">{experience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">Curated Collections</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Explore by Category</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Handpicked selections of the finest stadiums, hotels, restaurants, and attractions for your World Cup
              journey.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="stadiums" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 mb-12 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {[
                  { value: "stadiums", icon: MapPin, label: "Stadiums" },
                  { value: "hotels", icon: Building2, label: "Hotels" },
                  { value: "restaurants", icon: Utensils, label: "Restaurants" },
                  { value: "attractions", icon: Star, label: "Attractions" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-xl font-semibold"
                  >
                    <tab.icon className="mr-2 h-5 w-5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="stadiums" className="mt-0">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      id:400,
                      name: "Mohammed V Stadium",
                      city: "Casablanca",
                      capacity: "67,000",
                      rating: 4.9,
                      image: "https://www.bing.com/th/id/OIP.VgpTgLdpLoclhHdTZtTwswHaEm?w=242&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
                      features: ["FIFA Standard", "VIP Boxes", "Modern Facilities"],
                    },
                    {
                      id:379,
                      name: "Grand Stade de Marrakech",
                      city: "Marrakech",
                      capacity: "45,240",
                      rating: 4.8,
                      image: "https://www.bing.com/th/id/OIP.UIix6MA3nph5L0BXuoD7agHaE7?w=254&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
                      features: ["Eco-Friendly", "Premium Seating", "Cultural Design"],
                    },
                    {
                      id:375,
                      name: "Stade Ibn Batouta",
                      city: "Tangier",
                      capacity: "65,000",
                      rating: 4.9,
                      image: "https://th.bing.com/th/id/OIP.qFdLaxCf1-CHX7V_VjFl8QHaEK?w=317&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
                      features: ["Seaside Views", "Latest Technology", "Luxury Amenities"],
                    },
                  ].map((stadium, i) => (
                    <Card
                      key={i}
                      className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={stadium.image || "/placeholder.svg"}
                          alt={stadium.name}
                          width={500}
                          height={300}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 text-gray-900">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {stadium.rating}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{stadium.name}</CardTitle>
                        <CardDescription className="flex items-center text-base">
                          <MapPin className="mr-2 h-4 w-4 text-red-600" />
                          {stadium.city}, Morocco
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Capacity</span>
                          <span className="font-semibold">{stadium.capacity}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stadium.features.map((feature, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={()=> router.visit('/places/'+stadium.id)}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotels" className="mt-0">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      id:415,
                      name: "Royal Mansour",
                      city: "Marrakech",
                      rating: 5.0,
                      price: "From $800/night",
                      image: "https://www.bing.com/th?id=OLC.z3m%2bQPGUn%2bXH2g480x360&w=205&h=180&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
                      amenities: ["Spa", "Fine Dining", "Private Gardens"],
                    },
                    {
                      id:415,
                      name: "Four Seasons Hotel",
                      city: "Casablanca",
                      rating: 4.9,
                      price: "From $450/night",
                      image: "https://th.bing.com/th/id/OIP.J3Msn0XRf_pjeLww-qKh1wHaEK?w=321&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
                      amenities: ["Ocean View", "Business Center", "Pool"],
                    },
                    {
                      id:420,
                      name: "Mandarin Oriental",
                      city: "Rabat",
                      rating: 4.8,
                      price: "From $350/night",
                      image: "https://www.bing.com/th/id/OIP.qhUMLGCxN6-e36SfgGWdvgHaE8?w=241&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
                      amenities: ["City Center", "Wellness", "Rooftop Bar"],
                    },
                  ].map((hotel, i) => (
                    <Card
                      key={i}
                      className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={hotel.image || "/placeholder.svg"}
                          alt={hotel.name}
                          width={500}
                          height={300}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 text-gray-900">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {hotel.rating}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{hotel.name}</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-red-600" />
                            {hotel.city}, Morocco
                          </span>
                          <span className="font-semibold text-green-600">{hotel.price}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.map((amenity, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={()=> router.visit('/places/'+hotel.id)}>
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="restaurants" className="mt-0">
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold mb-4">Restaurant content coming soon...</h3>
                  <p className="text-gray-600">We're curating the finest dining experiences for you.</p>
                </div>
              </TabsContent>

              <TabsContent value="attractions" className="mt-0">
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold mb-4">Attractions content coming soon...</h3>
                  <p className="text-gray-600">Discover Morocco's most captivating destinations.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Traveler Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real experiences from travelers who have discovered the magic of Morocco with Atlasia.
            </p>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Enhanced CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-orange-900 z-10" />
              <div className="absolute inset-0">
                <img
                  src="/images/morocco-cta-background.jpg"
                  alt="Morocco CTA Background"
                  width={1200}
                  height={600}
                  className="w-full h-full object-cover opacity-30"
                />
              </div>

              <div className="relative z-20 p-12 md:p-16 lg:p-20 text-center">
                <Badge className="mb-6 bg-white/20 text-white border-white/30">Ready to Explore?</Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Your Moroccan Adventure Awaits
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of travelers who have chosen Atlasia Morocco as their trusted companion for the ultimate
                  World Cup 2030 experience.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                  >
                    Start Planning Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/70 bg-white/10 text-white hover:bg-white/20 hover:border-white px-8 py-4 text-lg"
                  >
                    Download App
                  </Button>
                </div>

                <div className="mt-12 flex justify-center items-center gap-8 text-white/80">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>50K+ Happy Travelers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Award Winning Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
    </AppLayout>
  )
}
