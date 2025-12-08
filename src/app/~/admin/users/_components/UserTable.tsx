"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Trash, RefreshCcw } from "lucide-react";

import {
  updateUserOnServer,
  deleteUserOnServer,
  resendLoginDetailsOnServer,
} from "../actions";

import { toast } from "sonner";
import { User } from "@/lib/types";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";

interface UserTableProps {
  initialUsers: User[];
  currentAdminEmail: string;
}

export function UserTable({ initialUsers, currentAdminEmail }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {}
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      return searchMatch && roleMatch;
    });
  }, [users, searchTerm, roleFilter]);

  // --------------------------
  // UPDATE ROLE (promote/demote)
  // --------------------------
  const handleUpdateUser = async (
    user: User,
    updates: Partial<{ role: "user" | "admin" }>
  ) => {
    setLoadingStates((prev) => ({ ...prev, [user.id]: "update" }));

    const result = await updateUserOnServer(user.id, updates);

    if (result.success && result.user) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === result.user!.id ? result.user! : u))
      );
      toast.success("User updated successfully.");
    } else {
      toast.error(result.error || "Failed to update user.");
    }

    setLoadingStates((prev) => ({ ...prev, [user.id]: "" }));
  };

  // --------------------------
  // DELETE USER
  // --------------------------
  const handleDeleteUser = async (user: User) => {
    setLoadingStates((prev) => ({ ...prev, [user.id]: "delete" }));

    const result = await deleteUserOnServer(user.id);

    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("User deleted.");
    } else {
      toast.error(result.error || "Failed to delete user.");
    }

    setLoadingStates((prev) => ({ ...prev, [user.id]: "" }));
  };

  // --------------------------
  // RESEND LOGIN DETAILS
  // --------------------------
  const handleResendLogin = async (user: User) => {
    setLoadingStates((prev) => ({ ...prev, [user.id]: "resend" }));

    const result = await resendLoginDetailsOnServer(user.id);

    if (result.success) {
      toast.success("Login email resent successfully.");
    } else {
      toast.error(result.error || "Failed to resend login email.");
    }

    setLoadingStates((prev) => ({ ...prev, [user.id]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isCurrentAdmin = user.email === currentAdminEmail;
              const isLoading = loadingStates[user.id];

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "-"}{" "}
                    {isCurrentAdmin && (
                      <span className="text-primary">(You)</span>
                    )}
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* Promote/Demote */}
                          <ConfirmActionModal
                            title={
                              user.role === "admin"
                                ? "Demote this user to User?"
                                : "Promote this user to Admin?"
                            }
                            actionLabel={
                              user.role === "admin" ? "Demote" : "Promote"
                            }
                            onConfirm={() =>
                              handleUpdateUser(user, {
                                role: user.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            <DropdownMenuItem disabled={isCurrentAdmin}>
                              {user.role === "admin"
                                ? "Demote to User"
                                : "Promote to Admin"}
                            </DropdownMenuItem>
                          </ConfirmActionModal>

                          {/* Resend Login Email */}
                          <ConfirmActionModal
                            title="Resend login details?"
                            description="This will reset the user's password to the default."
                            actionLabel="Resend"
                            onConfirm={() => handleResendLogin(user)}
                          >
                            <DropdownMenuItem>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Resend Login Email
                            </DropdownMenuItem>
                          </ConfirmActionModal>

                          {/* Delete User */}
                          <ConfirmActionModal
                            title={`Delete ${user.name || user.email}?`}
                            description="This action cannot be undone."
                            actionLabel="Delete"
                            onConfirm={() => handleDeleteUser(user)}
                          >
                            <DropdownMenuItem
                              disabled={isCurrentAdmin}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </ConfirmActionModal>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
