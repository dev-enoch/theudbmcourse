import { getUsers } from "@/lib/data";
import { UserTable } from "./_components/UserTable";
import { AddUserModal } from "./_components/AddUserModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }
  const currentAdminEmail = session.user.email;

  const users = await getUsers();

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

      <UserTable initialUsers={users} currentAdminEmail={currentAdminEmail} />
    </div>
  );
}
