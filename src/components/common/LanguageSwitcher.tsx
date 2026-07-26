"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Globe, Loader2 } from "lucide-react";
import { saveLanguagePreference } from "@/app/actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  currentLanguage?: "en" | "ha";
}

export function LanguageSwitcher({ currentLanguage = "en" }: Props) {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (lang: "en" | "ha") => {
    if (lang === currentLanguage) return;
    
    setIsSwitching(true);
    const res = await saveLanguagePreference(lang);
    
    if (res.success) {
      toast.success("Language preference updated!");
      window.location.reload();
    } else {
      toast.error("Failed to update language.");
      setIsSwitching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isSwitching}>
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline-block">
            {currentLanguage === "en" ? "English" : "Hausa"}
          </span>
          <span className="sm:hidden uppercase">{currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleSwitch("en")}
          className={currentLanguage === "en" ? "bg-muted font-medium" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSwitch("ha")}
          className={currentLanguage === "ha" ? "bg-muted font-medium" : ""}
        >
          Hausa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
