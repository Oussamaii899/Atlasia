import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, House, Save, History, Trello, Headset, MessageCircleCode } from 'lucide-react';
import AppLogo from './app-logo';


const mainNavItems: NavItem[] = [

    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Posts',
        href: '/posts',
        icon: Trello,
    },
    {
        title: 'Saves',
        href: '/saves',
        icon: Save,
    },
    {
        title: 'History',
        href: '/history',
        icon: History,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircleCode,
    }
];

const footerNavItems: NavItem[] = [
     {
        title: 'Support',
        href: '/support',
        icon: Headset,
    },
    /*
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    }, */
];

export function AppSidebar() {
    const { props } = usePage<{ auth: { user: { id: number; name: string; email: string } } }>();
    const user = props.auth?.user;  
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} user={user} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {
                    user ? (
                        <NavUser />
                    )
                    :
                    (
                        <div>
                            <Link href="/login" className="w-full">
                                <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary/80 dark:hover:bg-primary/70 dark:focus-visible:outline-primary dark:focus-visible:outline-offset-2 dark:focus-visible:outline-2 dark:focus-visible:outline-primary dark:text-white dark:hover:text-white dark:focus-visible:text-white transition-colors">
                                    Login
                                </button>
                            </Link>
                        </div>
                    )
                }
            </SidebarFooter>
        </Sidebar>
    );
}
