"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLanguagePreference } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export function LanguageModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSelect = async (language: "ha" | "en") => {
    setIsSubmitting(true);
    const res = await saveLanguagePreference(language);
    
    if (res.success) {
      toast.success("Language preference saved!");
      window.location.reload();
    } else {
      toast.error("Failed to save preference.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={() => {}}>
      {/* onOpenChange={() => {}} prevents dismissing by clicking outside or pressing escape */}
      <DialogContent className="sm:max-w-xl [&>button:last-child]:hidden">
        {/* [&>button:last-child]:hidden hides the default Dialog close (X) button */}
        <DialogHeader className="flex flex-col items-center text-center space-y-3 mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Globe className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-bold">Choose Your Language</DialogTitle>
          <DialogDescription className="text-base max-w-sm mx-auto">
            Please select your preferred language for the courses. Universal courses will always be available.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            disabled={isSubmitting}
            onClick={() => handleSelect("ha")}
          >
            <span className="text-xl font-semibold">Hausa</span>
            <span className="text-xs text-muted-foreground font-normal">Kwasoshin Hausa</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            disabled={isSubmitting}
            onClick={() => handleSelect("en")}
          >
            <span className="text-xl font-semibold">English</span>
            <span className="text-xs text-muted-foreground font-normal">English Courses</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
