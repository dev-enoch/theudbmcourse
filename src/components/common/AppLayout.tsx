import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";
import { Logo } from "./Logo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserMenu } from "./UserMenu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">BAG</span>
        </Link>
        <div className="ml-auto">
          <UserMenu email={session.user.email!} role={session.user.role} />
        </div>
      </header>
      <main className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
