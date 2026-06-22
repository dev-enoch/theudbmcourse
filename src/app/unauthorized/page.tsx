import { getSettings } from "@/lib/settings";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { RecoveryForm } from "./_components/RecoveryForm";
import { getAuthSession } from "@/lib/auth/getAuthSession";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UnauthorizedPage() {
  const session = await getAuthSession();
  if (session) {
    redirect("/");
  }

  const settings = await getSettings();
  const payonaireLink = settings?.payonairePurchaseLink || "https://payonaire.com";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="max-w-md w-full border-border/60 shadow-2xl relative bg-card/80 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2 pt-8">
          <div className="p-4 bg-primary/10 text-primary rounded-full mb-2 animate-bounce">
            <Lock className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Access Locked</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Welcome to the **Blueprint Automated Gains** course. It looks like you do not have permission to view this content yet.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To unlock lifetime access to all course blueprints, video guides, and exclusive resources, please complete your purchase.
          </p>
          
          <div className="pt-4 pb-2">
            <Button asChild size="lg" className="w-full text-base font-semibold group py-6 shadow-md transition-all duration-300">
              <Link href={payonaireLink} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Buy Now on Payonaire
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <RecoveryForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-2 bg-muted/40 border-t py-4 px-6 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            Already purchased?
          </p>
          <p className="text-xs text-muted-foreground max-w-[280px]">
            Please check your email receipt and click the instant access redirect link from your device.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
