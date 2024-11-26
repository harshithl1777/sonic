import { ReactNode, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/containers/ModeToggle';
import '@/components/pulse.css';
import { Loader2 } from 'lucide-react';
import supabase from '@/config/supabase';

interface LayoutProps {
    children: ReactNode;
    name: string;
}

const Layout: React.FC<LayoutProps> = ({ children, name }) => {
    const [status, setStatus] = useState<'SUCCESS' | 'DOWN' | 'ERROR' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonitors = async () => {
            try {
                const response = await supabase.functions.invoke('SonicUptimeClient');
                const monitors = response.data.data;
                const success = monitors.every(
                    (monitor: { attributes: { status: string } }) => monitor.attributes.status === 'up',
                );
                setStatus(success ? 'SUCCESS' : 'DOWN');
            } catch (error: any) {
                setStatus('ERROR');
            } finally {
                setLoading(false);
            }
        };

        fetchMonitors();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-input'>
                    <div className='flex items-center gap-2 px-4'>
                        <SidebarTrigger className='-ml-1' />
                        <Separator orientation='vertical' className='mr-2 h-4' />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {['Backlog', 'Scheduled', 'Completed'].includes(name) ? (
                                    <>
                                        <BreadcrumbItem className='hidden md:block'>
                                            <BreadcrumbLink>Emails</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className='hidden md:block' />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{name}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                ) : (
                                    <BreadcrumbPage>
                                        <BreadcrumbLink href='#'>{name}</BreadcrumbLink>
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='ml-auto mr-4 flex flex-row gap-4 items-center'>
                        <div
                            className='flex flex-row gap-2 items-center cursor-pointer'
                            onClick={() => {
                                if (!loading) window.open('https://trysonic.betteruptime.com/');
                            }}
                        >
                            {!loading ? (
                                <>
                                    <div
                                        className={`
                                            ${
                                                status === 'SUCCESS'
                                                    ? 'pulse-teal'
                                                    : status === 'DOWN'
                                                    ? 'pulse-rose'
                                                    : 'pulse-orange'
                                            }
                                        `}
                                    />
                                    <h4
                                        className={`text-sm font-medium
                                            ${
                                                status === 'SUCCESS'
                                                    ? 'text-teal-500'
                                                    : status === 'DOWN'
                                                    ? 'text-rose-500'
                                                    : 'text-orange-500'
                                            }
                                        `}
                                    >
                                        {status === 'SUCCESS'
                                            ? 'All services operational'
                                            : status === 'DOWN'
                                            ? 'Some services down'
                                            : 'Unable to contact uptime API'}
                                    </h4>
                                </>
                            ) : (
                                <div className='flex flex-row gap-2'>
                                    <Loader2 className='animate-spin text-slate-400' size={20} />
                                    <h4 className='text-sm text-slate-300'>Retrieving uptime status</h4>
                                </div>
                            )}
                        </div>
                        <ModeToggle />
                    </div>
                </header>
                <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
