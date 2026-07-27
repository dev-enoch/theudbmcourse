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
import { PaginationControls } from "./PaginationControls";
import {
  updateUserOnServer,
  deleteUserOnServer,
  resendLoginDetailsOnServer,
  resetUserProgressOnServer,
} from "../actions";
import { toast } from "sonner";

type ModalType = "promote" | "resend" | "delete" | "resetProgress" | null;

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
      <div className="overflow-x-auto">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/~/admin/users/${user.id}`)}
                      >
                        Manage
                      </Button>
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

      {/* Pagination */}
      <PaginationControls
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={goToPage}
      />

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
                ? "Reset device lock?"
                : activeModalType === "delete"
                  ? `Delete ${activeUser?.name || activeUser?.email}?`
                  : ""
        }
        description={
          activeModalType === "resend"
            ? "This will reset the user's password to the default."
            : activeModalType === "resetProgress"
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
