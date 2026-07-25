import { Wrench } from "lucide-react";
import { Logo } from "@/components/common/Logo";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <Logo className="mb-8 h-16 w-auto" />
      <div className="rounded-xl border bg-card text-card-foreground shadow max-w-md w-full p-8 text-center">
        <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-4 tracking-tight">We'll be back soon!</h1>
        <p className="text-muted-foreground text-lg">
          We are currently performing some scheduled maintenance. 
          Please check back shortly. Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
