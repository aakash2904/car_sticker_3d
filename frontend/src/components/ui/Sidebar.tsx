'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect } from 'react';
import {
  LayoutDashboard, Sticker, Car, Users,
  BarChart3, Shield, LogOut, ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/stickers',  label: 'Stickers',  icon: Sticker },
      { href: '/vehicles',  label: 'Vehicles',  icon: Car },
      { href: '/owners',    label: 'Owners',    icon: Users },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen border-r transition-colors duration-200
      bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
          <Car className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">CarSticker</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Management Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {NAV_SECTIONS.map(({ label, items }) => {
          const visibleItems = items.filter(
            i => !(i as any).adminOnly || user?.role === 'admin'
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={label} className="mb-3">
              <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider
                text-gray-400 dark:text-slate-600">
                {label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(({ href, label: lbl, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                      {lbl}
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400 dark:text-blue-500" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom: theme + user + logout */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-3 space-y-2">
        <ThemeToggle />

        {user && (
          <div className="px-2 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{user.name || user.userid}</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 capitalize">{user.role}</p>
          </div>
        )}

        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
            text-gray-500 hover:bg-red-50 hover:text-red-600
            dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400
            transition-all duration-150">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
