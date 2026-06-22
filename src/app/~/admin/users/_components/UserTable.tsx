"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { MoreHorizontal, Loader2, Trash, RefreshCcw, RotateCcw, MonitorSmartphone } from "lucide-react";
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
  resetUserProgressOnServer,
  resetDeviceLockOnServer,
} from "../actions";
import { toast } from "sonner";

type ModalType = "promote" | "resend" | "delete" | "resetProgress" | "resetDeviceLock" | null;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {}
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Sync users when initialUsers changes (after server refresh)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

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
        const result = await updateUserOnServer(activeUser.id, {
          role: activeUser.role === "admin" ? "user" : "admin",
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("User role updated successfully.");
          // Update the user in the local state
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === activeUser.id
                ? { ...u, role: activeUser.role === "admin" ? "user" : "admin" }
                : u
            )
          );
        }
      } else if (activeModalType === "resend") {
        const result = await resendLoginDetailsOnServer(activeUser.id);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Login details resent successfully.");
        }
      } else if (activeModalType === "resetProgress") {
        const result = await resetUserProgressOnServer(activeUser.id);
        if ("error" in result) {
          toast.error(result.error as string);
        } else {
          toast.success("User progress reset successfully.");
        }
      } else if (activeModalType === "resetDeviceLock") {
        const result = await resetDeviceLockOnServer(activeUser.email);
        if ("error" in result) {
          toast.error(result.error as string);
        } else {
          toast.success("Device lock reset successfully.");
        }
      } else if (activeModalType === "delete") {
        const result = await deleteUserOnServer(activeUser.id);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("User deleted.");

          // Check if this was the last user on the current page
          const remainingUsers = users.filter((u) => u.id !== activeUser.id);

          // If we're on a page > 1 and this was the last user, go to previous page
          if (remainingUsers.length === 0 && pagination.page > 1) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", (pagination.page - 1).toString());
            router.push(`?${params.toString()}`);
          } else {
            // Remove the user from local state
            setUsers(remainingUsers);
            // Refresh to get updated pagination info
            router.refresh();
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed.");
    }

    setLoadingStates((prev) => ({ ...prev, [activeUser.id]: "" }));
    setConfirmModalOpen(false);
    setActiveUser(null);
    setActiveModalType(null);

    // Only refresh if we didn't already navigate away
    if (
      activeModalType !== "delete" ||
      users.filter((u) => u.id !== activeUser.id).length > 0
    ) {
      router.refresh();
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
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
                            onSelect={() => openModal(user, "resetProgress")}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Course Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => openModal(user, "resetDeviceLock")}
                          >
                            <MonitorSmartphone className="mr-2 h-4 w-4" /> Reset Device Lock
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
            : activeModalType === "resetProgress"
            ? "Reset course progress?"
            : activeModalType === "resetDeviceLock"
            ? "Reset device lock?"
            : activeModalType === "delete"
            ? `Delete ${activeUser?.name || activeUser?.email}?`
            : ""
        }
        description={
          activeModalType === "resend"
            ? "This will reset the user's password to the default."
            : activeModalType === "resetProgress"
            ? "This will clear the user's course progress."
            : activeModalType === "resetDeviceLock"
            ? "This will clear any active device lock for the user's email."
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
            : activeModalType === "resetProgress"
            ? "Reset Progress"
            : activeModalType === "resetDeviceLock"
            ? "Reset Lock"
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
