"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MobileNav({ role, dict }: { role?: "user" | "admin", dict?: Dictionary }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: dict?.nav.dashboard || "Home",
      href: "/",
      icon: Home,
    },
    {
      label: dict?.nav.profile || "Profile",
      href: "/profile",
      icon: User,
    }
  ];

  if (role === "admin") {
    navItems.push({
      label: "Admin",
      href: "/~/admin",
      icon: Shield,
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom))] w-full items-center justify-around border-t bg-background pb-[env(safe-area-inset-bottom)] sm:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground transition-all active:scale-90 active:opacity-70 hover:text-foreground",
              isActive && "text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
