import { getUsers } from "@/lib/data";
import { UserTable } from "./_components/UserTable";
import { AddUserModal } from "./_components/AddUserModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";

interface AdminUsersPageProps {
  searchParams?: { page?: string; limit?: string };
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentAdminEmail = session.user.email;

  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams?.limit ? parseInt(searchParams.limit, 10) : 10;

  const { users, pagination } = await getUsers({ page, limit });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View, search, and manage user roles.
          </p>
        </div>
        <AddUserModal />
      </div>

      {/* Pass the users and pagination to a client-side UserTable */}
      <UserTable
        initialUsers={users}
        currentAdminEmail={currentAdminEmail}
        pagination={pagination}
      />
    </div>
  );
}
