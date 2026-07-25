"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Megaphone, Mail } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/~/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/~/admin/users", label: "Users", icon: Users },
    { href: "/~/admin/marketing", label: "Marketing", icon: Megaphone },
    { href: "/~/admin/mail", label: "Mail", icon: Mail },
    { href: "/~/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background md:hidden px-2 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const isActive =
          link.href === "/~/admin"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
