import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { UserMenu } from "./UserMenu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Universal Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Logo />
          <span>BAG Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Mobile navigation links (hidden on desktop) */}
          <div className="flex gap-4 sm:hidden text-sm font-medium text-muted-foreground">
            <Link href="/~/admin/users" className="hover:text-primary">Users</Link>
            <Link href="/~/admin/settings" className="hover:text-primary">Settings</Link>
          </div>
          <UserMenu email={session.user.email!} role={session.user.role} />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className="fixed top-14 left-0 z-30 hidden w-64 shrink-0 border-r bg-muted/20 md:block" 
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="grid items-start text-sm font-medium gap-2">
              <Link
                href="/~/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50"
              >
                Users
              </Link>
              <Link
                href="/~/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50"
              >
                Settings
              </Link>
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 lg:p-8 bg-background">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
