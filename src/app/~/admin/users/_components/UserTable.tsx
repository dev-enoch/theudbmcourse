"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Trash, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/types";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";
import {
  updateUserOnServer,
  deleteUserOnServer,
  resendLoginDetailsOnServer,
} from "../actions";
import { toast } from "sonner";

type ModalType = "promote" | "resend" | "delete" | null;

interface UserTableProps {
  initialUsers: User[];
  currentAdminEmail: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function UserTable({
  initialUsers,
  currentAdminEmail,
  pagination,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {}
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

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
        toast.success("User role updated successfully.");
      } else if (activeModalType === "resend") {
        await resendLoginDetailsOnServer(activeUser.id);
        toast.success("Login details resent successfully.");
      } else if (activeModalType === "delete") {
        await deleteUserOnServer(activeUser.id);
        toast.success("User deleted.");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed.");
    }

    setLoadingStates((prev) => ({ ...prev, [activeUser.id]: "" }));
    setConfirmModalOpen(false);
    setActiveUser(null);
    setActiveModalType(null);

    // Reload current page to reflect changes
    window.location.reload();
  };

  const goToPage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    window.location.href = url.toString();
  };

  return (
    <div className="space-y-4">
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
          {users.length > 0 ? (
            users.map((user) => {
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
                            <RefreshCcw className="mr-2 h-4 w-4" /> Resend Login
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isCurrentAdmin}
                            className="text-red-600"
                            onSelect={() => openModal(user, "delete")}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete User
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={pagination.page === 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

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
