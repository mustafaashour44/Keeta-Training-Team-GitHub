import { Bell, BookOpenCheck, ChartNoAxesCombined, ClipboardList, FileBarChart, Gauge, HelpCircle, LayoutDashboard, Menu, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const navigation = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/activities', label: 'Activities', icon: ClipboardList },
  { href: '/sessions', label: 'Sessions', icon: BookOpenCheck },
  { href: '/coverage', label: 'Coverage', icon: Gauge },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/head-count', label: 'Head count', icon: ChartNoAxesCombined },
  { href: '/updates', label: 'Updates', icon: Bell },
  { href: '/workload', label: 'Workload', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = navigation.find((item) => item.href === location)?.label ?? 'Overview';
  return (
    <div className="app-shell md:grid md:grid-cols-[246px_1fr]">
      <aside className={`app-sidebar px-3 py-5 md:px-4 ${mobileOpen ? 'block' : ''}`}>
        <div className="flex items-center justify-between px-2 md:px-3">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 font-black text-xl text-amber-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16),0_5px_16px_rgba(4,120,87,.2)]">K</span>
            <span className="text-sm font-bold leading-tight">Keeta<br /><span className="font-medium text-[hsl(var(--sidebar-foreground)/.6)]">Training Team</span></span>
          </Link>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={18} /></button>
        </div>
        <div className="mt-9 hidden px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.38)] md:block">Workspace</div>
        <nav className="mobile-nav mt-3 gap-1 md:block" aria-label="Primary navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link key={href} href={href} data-active={active} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)} className="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium md:mb-1">
                <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                <span className="mobile-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-[hsl(var(--sidebar-border))] pt-5 md:block">
          <Link href="/settings" data-testid="link-nav-settings" className="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"><Settings size={17} /><span>Settings</span></Link>
          <button data-testid="button-help" className="sidebar-link mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium"><HelpCircle size={17} /><span>Help center</span></button>
        </div>
      </aside>
      <div className="app-main min-w-0">
        <header className="flex h-[74px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.85)] px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button>
            <div><p className="eyebrow md:hidden">{current}</p><p className="hidden text-sm text-[hsl(var(--muted-foreground))] md:block">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5" aria-label="Notifications" data-testid="button-notifications"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[hsl(var(--secondary))]" /></button>
            <div className="flex items-center gap-2 border-l border-[hsl(var(--border))] pl-3">
              <span className="grid size-9 place-items-center rounded-full bg-[hsl(var(--primary)/.14)] text-xs font-bold text-[hsl(var(--primary))]">MN</span>
              <div className="hidden leading-tight sm:block"><p className="text-sm font-semibold">Keeta team</p><p className="text-[11px] text-[hsl(var(--muted-foreground))]">Shared workspace</p></div>
            </div>
          </div>
        </header>
        <main className="page-enter px-5 py-7 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  );
}
