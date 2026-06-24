"use client";

import { useEffect, useRef } from "react";
import { processActivation } from "./actions";
import { Loader2 } from "lucide-react";

export default function AutoActivate({ orderId, email, name }: { orderId: string; email: string; name?: string }) {
  const activated = useRef(false);

  useEffect(() => {
    if (!activated.current) {
      activated.current = true;
      processActivation(orderId, email, name).catch(console.error);
    }
  }, [orderId, email, name]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold mb-2">Activating your access...</h2>
      <p className="text-muted-foreground text-sm">Please wait while we secure your session.</p>
    </div>
  );
}
