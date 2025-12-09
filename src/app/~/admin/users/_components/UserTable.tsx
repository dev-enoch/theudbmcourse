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

type ModalType = "promote" | "resend" | "delete" | null;

export function UserTable({ initialUsers, currentAdminEmail }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {}
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      return searchMatch && roleMatch;
    });
  }, [users, searchTerm, roleFilter]);

  const openModal = (user: User, type: ModalType) => {
    setActiveUser(user);
    setActiveModalType(type);
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!activeUser || !activeModalType) return;

    setLoadingStates((prev) => ({ ...prev, [activeUser.id]: activeModalType }));

    try {
      if (activeModalType === "promote") {
        await updateUserOnServer(activeUser.id, {
          role: activeUser.role === "admin" ? "user" : "admin",
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === activeUser.id
              ? { ...u, role: activeUser.role === "admin" ? "user" : "admin" }
              : u
          )
        );
        toast.success("User role updated successfully.");
      } else if (activeModalType === "resend") {
        await resendLoginDetailsOnServer(activeUser.id);
        toast.success("Login details resent successfully.");
      } else if (activeModalType === "delete") {
        await deleteUserOnServer(activeUser.id);
        setUsers((prev) => prev.filter((u) => u.id !== activeUser.id));
        toast.success("User deleted.");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed.");
    }

    setLoadingStates((prev) => ({ ...prev, [activeUser.id]: "" }));
    setConfirmModalOpen(false);
    setActiveUser(null);
    setActiveModalType(null);
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

                          <DropdownMenuItem
                            disabled={isCurrentAdmin}
                            onSelect={() => openModal(user, "promote")}
                          >
                            {user.role === "admin"
                              ? "Demote to User"
                              : "Promote to Admin"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => openModal(user, "resend")}
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Resend Login Email
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={isCurrentAdmin}
                            className="text-red-600"
                            onSelect={() => openModal(user, "delete")}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
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

      {/* Confirm Modal */}
      <ConfirmActionModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        title={
          activeModalType === "promote"
            ? activeUser?.role === "admin"
              ? "Demote this user to User?"
              : "Promote this user to Admin?"
            : activeModalType === "resend"
            ? "Resend login details?"
            : activeModalType === "delete"
            ? `Delete ${activeUser?.name || activeUser?.email}?`
            : ""
        }
        description={
          activeModalType === "resend"
            ? "This will reset the user's password to the default."
            : activeModalType === "delete"
            ? "This action cannot be undone."
            : undefined
        }
        actionLabel={
          activeModalType === "promote"
            ? activeUser?.role === "admin"
              ? "Demote"
              : "Promote"
            : activeModalType === "resend"
            ? "Resend"
            : activeModalType === "delete"
            ? "Delete"
            : ""
        }
        onConfirm={handleConfirmAction}
        loading={
          !!activeUser && !!activeModalType && !!loadingStates[activeUser.id]
        }
      />
    </div>
  );
}
