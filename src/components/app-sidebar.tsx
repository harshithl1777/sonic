import * as React from 'react';
import { CalendarClock, Fan, LayoutDashboard, ListTodo, MailCheck, MailPlus, Settings } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
    user: {
        name: 'Apekshya Pokharel',
        email: 'apekshyapokharel@gmail.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        {
            title: 'Dashboard',
            url: '/app/dashboard',
            icon: LayoutDashboard,
            items: [],
        },
        {
            title: 'Emails',
            url: '/',
            icon: MailPlus,
            items: [
                {
                    title: 'Backlog',
                    url: '/app/emails/backlog',
                    icon: ListTodo,
                },
                {
                    title: 'Scheduled',
                    url: '/app/emails/scheduled',
                    icon: CalendarClock,
                },
                {
                    title: 'Completed',
                    url: '/app/emails/completed',
                    icon: MailCheck,
                },
            ],
        },
        {
            title: 'Settings',
            url: '/app/settings',
            icon: Settings,
            items: [],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                    <div className='flex aspect-square size-8 items-center justify-center rounded-md bg-violet-700 text-sidebar-primary-foreground'>
                        <Fan />
                    </div>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>Sonic</span>
                        <span className='truncate text-xs'>Cold-Emailing Done Better</span>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
