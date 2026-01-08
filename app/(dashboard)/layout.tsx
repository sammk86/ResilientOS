'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  LogOut,
  Menu, // Mobile menu trigger
  Shield,
  Activity,
  FileText,
  Smartphone,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { cn } from '@/lib/utils';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={''} alt={user.name || ''} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Governance', href: '/governance', icon: Shield },
  { name: 'Risk Management', href: '/risk', icon: Activity },
  { name: 'Frameworks', href: '/frameworks', icon: Shield }, // Using Shield or other icon
  { name: 'Assessments', href: '/assessments', icon: FileText },
  { name: 'BIA', href: '/bia', icon: FileText },
  { name: 'Plan', href: '/plan', icon: Smartphone },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-secondary/30 border-r border-border w-64 hidden md:flex shrink-0">


      {/* Nav */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-background text-primary shadow-sm border border-border"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </div>


    </div>
  )
}

function MobileHeader() {
  return (
    <header className="md:hidden border-b bg-card p-4 flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <img src="/logo.png" alt="ResilientOS" className="h-10 w-auto dark:invert dark:hue-rotate-180" />
      </Link>
      {/* Simple Mobile Menu Fallback since Sheet isn't fully implemented/imported with shadcn pattern here yet */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem asChild>
            <Link href="/sign-out">Sign Out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

import { ModeToggle } from '@/components/theme-toggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* NEW PORTAL HEADER (Full Width) */}
      <header className="hidden md:flex items-center justify-between p-4 border-b bg-card z-10 shrink-0">
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ResilientOS" className="h-10 w-auto dark:invert dark:hue-rotate-180" />
        </Link>

        {/* RIGHT: User Icon & Theme Toggle */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Suspense fallback={<div className="h-8 w-8 bg-muted rounded-full" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
