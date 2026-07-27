import { getAuthSession } from "@/lib/auth/getAuthSession";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { UserMenu } from "./UserMenu";
import { SidebarNav } from "./_components/SidebarNav";
import { MobileNav } from "./_components/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Universal Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Logo />
          <span>BAG Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <UserMenu email={session.email} role={session.role} />
        </div>
      </header>
      
      {/* Mobile Tabbed Navigation */}
      <MobileNav />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className="fixed top-14 left-0 z-30 hidden w-64 shrink-0 border-r bg-muted/20 md:block" 
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <SidebarNav />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 pb-24 md:pb-4 lg:p-8 bg-background">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
