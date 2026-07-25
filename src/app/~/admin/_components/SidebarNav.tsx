"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Megaphone, Mail } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/~/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/~/admin/users", label: "Users", icon: Users },
    { href: "/~/admin/settings", label: "Settings", icon: Settings },
    { href: "/~/admin/marketing", label: "Marketing", icon: Megaphone },
    { href: "/~/admin/mail", label: "Mail", icon: Mail },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-4">
      <div className="grid items-start text-sm font-medium gap-2">
        {links.map((link) => {
          const isActive = link.href === "/~/admin" 
            ? pathname === link.href 
            : pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
