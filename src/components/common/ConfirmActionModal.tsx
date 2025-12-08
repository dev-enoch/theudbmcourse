"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmActionModalProps {
  title: string;
  description?: string;
  actionLabel: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function ConfirmActionModal({
  title,
  description,
  actionLabel,
  onConfirm,
  children,
}: ConfirmActionModalProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && <p className="mb-4">{description}</p>}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>{actionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
