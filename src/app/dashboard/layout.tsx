
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  LayoutDashboard,
  LogOut,
  User,
  FilePlus2,
  History,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLocalization } from '@/context/localization-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    labelKey: 'nav.dashboard',
  },
  {
    href: '/dashboard/patients/new',
    icon: FilePlus2,
    labelKey: 'nav.newPatient',
  },
  {
    href: '/dashboard/history',
    icon: History,
    labelKey: 'nav.patientHistory',
  },
  {
    href: '/dashboard/profile',
    icon: User,
    labelKey: 'nav.profile',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();
  const { logout } = useAuth();
  const pathname = usePathname();
  const { t } = useLocalization();
  const isMobile = useIsMobile();

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <HeartPulse className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }
  
  if (isMobile) {
    return (
        <div className="flex flex-col h-screen">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-primary">CardioArt</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
          <nav className="sticky bottom-0 z-10 border-t bg-background">
            <div className="grid grid-cols-4 items-center justify-items-center gap-2 px-2 py-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.href} legacyBehavior passHref>
                    <Button
                      variant="ghost"
                      className={`flex h-14 w-full flex-col items-center justify-center gap-1 rounded-none text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.labelKey)}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">CardioArt</span>
          </Link>
        </div>
        <nav className="flex flex-col justify-between flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <item.icon className="h-5 w-5" />
                      {t(item.labelKey)}
                    </Button>
                  </Link>
                );
            })}
          </div>
          <div>
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2">
                <LogOut className="h-5 w-5" />
                {t('nav.logout')}
            </Button>
          </div>
        </nav>
      </aside>
      <div className="flex flex-col w-full md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                            {user.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>{t('nav.profile')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
