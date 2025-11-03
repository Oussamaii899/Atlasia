"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import type { NavItem, User } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import { Shield, Users, MapPin, Tags, BarChart3, FileText, Globe } from "lucide-react"

const adminNavItems = [

  {
    title: "Users",
    href: "/users",
    icon: Users,
    description: "Manage travelers & accounts",
  },
  {
    title: "Places",
    href: "/places",
    icon: MapPin,
    description: "Manage destinations & locations",
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
    description: "Organize content categories",
  },
  {
    title: "Comments",
    href: "/comments",
    icon: FileText,
    description: "Moderate user comments & reviews",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "View analytics & user reports",
  },
]

export function NavMain({ items = [], user }: { items: NavItem[]; user?: User }) {
  const page = usePage()

  // Helper function to check if route is active (including sub-routes)
  const isActiveRoute = (href: string) => {
    if (href === page.url) return true
    if (href !== "/" && page.url.startsWith(href + "/")) return true
    return false
  }

  return (
    <>
      {/* Main Navigation */}
      <SidebarGroup className="px-2 py-0">
        <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 mb-2">
          Navigation
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActiveRoute(item.href)}
                tooltip={{ children: item.title }}
                className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500/10 data-[active=true]:to-teal-500/10 data-[active=true]:border-emerald-200 dark:data-[active=true]:border-emerald-800"
              >
                <Link href={item.href} prefetch className="flex items-center gap-3">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Admin Section */}
      {user && user.role === "admin" && (
        <SidebarGroup className="px-2 py-0 mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 mb-2 flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Administration
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
            >
              Admin
            </Badge>
          </SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActiveRoute(item.href)}
                  tooltip={{
                    children: (
                      <div className="space-y-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    ),
                  }}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-red-500/10 data-[active=true]:to-orange-500/10 data-[active=true]:border-red-200 dark:data-[active=true]:border-red-800"
                >
                  <Link href={item.href} prefetch className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* Quick Actions for Admin */}
      {user && user.role === "admin" && (
        <SidebarGroup className="px-2 py-0 mt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip={{ children: "View Public Site" }}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span className="text-xs">View Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}
