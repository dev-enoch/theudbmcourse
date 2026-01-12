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
    <div className="flex flex-col min-h-screen">
      {/* Top header */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span>BAG Admin</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <UserMenu email={session.user.email!} role={session.user.role} />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background">
        <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-6">
          <div className="flex gap-6">
            <Link
              href="/~/admin/users"
              className="py-4 text-sm font-medium border-b-2 border-transparent hover:border-primary transition-colors"
            >
              Users
            </Link>
            <Link
              href="/~/admin/settings"
              className="py-4 text-sm font-medium border-b-2 border-transparent hover:border-primary transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-4 lg:p-6 bg-background max-w-[1440px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
