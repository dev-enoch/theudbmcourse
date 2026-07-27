import { getUserProfile, readCoursesFile } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/getAuthSession";
import { UserProfileClient } from "./_components/UserProfileClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.email) redirect("/login");

  const resolvedParams = await params;
  const user = await getUserProfile(resolvedParams.userId);
  const courses = await readCoursesFile();

  if (!user) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/~/admin/users"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Users
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unknown User"}</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {/* Action buttons passed to client */}
          </div>
        </div>
      </div>

      <UserProfileClient user={user} courses={courses} />
    </div>
  );
}
