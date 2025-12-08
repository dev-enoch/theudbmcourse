"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addUserOnServer } from "../actions";
import { Loader2 } from "lucide-react";

interface AddUserModalProps {}

export function AddUserModal({}: AddUserModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isPending, startTransition] = useTransition();

  const handleAddUser = () => {
    startTransition(async () => {
      try {
        const result = await addUserOnServer({ name, email, role });

        if (result.success && result.user) {
          toast.success(
            `User "${result.user.name}" added successfully! Default password: 123456`
          );
          setOpen(false);
          setName("");
          setEmail("");
          setRole("user");
        } else {
          toast.error(result.error || "Failed to add user.");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to add user.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            value={role}
            onValueChange={(val) => setRole(val as "user" | "admin")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleAddUser} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
