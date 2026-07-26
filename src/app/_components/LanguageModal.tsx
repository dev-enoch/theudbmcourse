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
      router.refresh(); // Refresh to trigger server-side re-render with new preference
    } else {
      toast.error("Failed to save preference.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={() => {}}>
      {/* onOpenChange={() => {}} prevents dismissing by clicking outside or pressing escape */}
      <DialogContent className="w-screen h-screen max-w-none border-none !rounded-none flex flex-col items-center justify-center p-6 [&>button:last-child]:hidden bg-background">
        {/* [&>button:last-child]:hidden hides the default Dialog close (X) button */}
        <DialogHeader className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="p-4 bg-primary/10 text-primary rounded-full">
            <Globe className="w-12 h-12 md:w-16 md:h-16" />
          </div>
          <DialogTitle className="text-3xl md:text-5xl font-bold">Choose Your Language</DialogTitle>
          <DialogDescription className="text-lg md:text-xl max-w-lg mx-auto mt-2">
            Please select your preferred language for the courses. Universal courses will always be available.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
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
