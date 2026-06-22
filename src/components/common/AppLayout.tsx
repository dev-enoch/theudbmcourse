import { getAuthSession } from "@/lib/auth/getAuthSession";
import { Logo } from "./Logo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserMenu } from "./UserMenu";
import { getSettings } from "@/lib/settings";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  const settings = await getSettings();

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen">
      {settings?.announcementEnabled && settings?.announcementBanner && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
          {settings.announcementBanner}
        </div>
      )}
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">BAG</span>
        </Link>
        <div className="ml-auto">
          <UserMenu email={session.email} role={session.role} />
        </div>
      </header>
      <main className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
