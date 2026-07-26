"use client";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { User, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { clearPayonaireCookie } from "@/app/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface Props {
  email: string;
  role: "admin" | "user";
  dict?: Dictionary;
}

export function UserMenu({ email, role, dict }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/~/admin">
              <Shield className="mr-2 h-4 w-4" />
              <span>{dict?.nav.adminDashboard || "Admin Panel"}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <button
            onClick={async () => {
              await clearPayonaireCookie();
              signOut({ callbackUrl: role === "admin" ? "/login" : "/" });
            }}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{dict?.nav.logout || "Sign Out"}</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
