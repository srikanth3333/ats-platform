"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  CalendarIcon, 
  BarChartIcon, 
  SettingsIcon,
  LogOutIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Candidates', href: '/candidates', icon: UsersIcon },
  { name: 'Applications', href: '/applications', icon: ClipboardListIcon },
  { name: 'Interviews', href: '/interviews', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: BarChartIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <BriefcaseIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">TalentTrack</h1>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <LogOutIcon className="h-5 w-5 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}