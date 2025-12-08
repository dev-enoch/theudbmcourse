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
import { MoreHorizontal, Loader2 } from "lucide-react";
import { updateUserOnServer } from "../actions";
import { toast } from "sonner";
import { User } from "@/lib/types";

interface UserTableProps {
  initialUsers: User[];
  currentAdminEmail: string;
}

export function UserTable({ initialUsers, currentAdminEmail }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
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

  const handleUpdateUser = async (
    user: User,
    updates: Partial<{ role: "user" | "admin" }>
  ) => {
    setLoadingStates((prev) => ({ ...prev, [user.id]: true }));

    const result = await updateUserOnServer(user.id, updates);

    if (result.success && result.user) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === result.user!.id ? result.user! : u))
      );
      toast.success("User updated successfully.");
    } else {
      toast.error(result.error || "Failed to update user.");
    }

    setLoadingStates((prev) => ({ ...prev, [user.id]: false }));
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
                    {loadingStates[user.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={isCurrentAdmin && user.role === "admin"}
                            onSelect={() =>
                              handleUpdateUser(user, {
                                role: user.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            {user.role === "admin"
                              ? "Demote to User"
                              : "Promote to Admin"}
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
    </div>
  );
}
