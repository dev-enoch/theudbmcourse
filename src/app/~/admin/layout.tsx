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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Logo />
            <span>BAG Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="grid items-start px-4 text-sm font-medium gap-2">
            <Link
              href="/~/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              Users
            </Link>
            <Link
              href="/~/admin/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:pl-64 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          {/* Mobile brand (hidden on desktop) */}
          <Link href="/" className="flex items-center gap-2 font-semibold sm:hidden">
            <Logo />
            <span>BAG Admin</span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {/* Mobile navigation links (hidden on desktop) */}
            <div className="flex gap-4 mr-2 sm:hidden text-sm font-medium text-muted-foreground">
              <Link href="/~/admin/users" className="hover:text-primary">Users</Link>
              <Link href="/~/admin/settings" className="hover:text-primary">Settings</Link>
            </div>
            <UserMenu email={session.user.email!} role={session.user.role} />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8 bg-background sm:rounded-tl-2xl sm:border-t sm:border-l shadow-sm min-h-full">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
