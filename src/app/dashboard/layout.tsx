
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  HeartPulse,
  LayoutDashboard,
  LogOut,
  User,
  FilePlus2,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/localization-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();
  const { logout } = useAuth();
  const pathname = usePathname();
  const { t } = useLocalization();

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
    },
    {
      href: '/dashboard/patients/new',
      icon: FilePlus2,
      label: t('nav.newPatient'),
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: t('nav.profile'),
    },
  ];

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <HeartPulse className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 p-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">CardioArt</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip={{ children: t('nav.logout') }}>
                <LogOut />
                <span>{t('nav.logout')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col text-sm md:flex">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
