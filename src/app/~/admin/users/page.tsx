import { getUsers } from "@/lib/data";
import { UserTable } from "./_components/UserTable";
import { AddUserModal } from "./_components/AddUserModal";

export default async function AdminUsersPage() {
  // Server call to get users
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
        {/* Add User Modal is now a Client Component */}
        <AddUserModal />
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
