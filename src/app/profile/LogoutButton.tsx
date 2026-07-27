"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { clearPayonaireCookie } from "@/app/actions";

export function LogoutButton() {
  return (
    <Button
      variant="destructive"
      className="w-full mt-6"
      onClick={async () => {
        await clearPayonaireCookie();
        signOut({ callbackUrl: "/" });
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
