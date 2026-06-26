import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import ClaimedOrder from "@/models/ClaimedOrder";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import AutoActivate from "./AutoActivate";

type WelcomePageProps = {
  searchParams: Promise<{
    order_id?: string;
    email?: string;
    name?: string;
  }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { order_id: orderId, email, name } = await searchParams;

  if (!orderId || !email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="p-3 bg-destructive/10 text-destructive rounded-full">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              The activation link is malformed. It must contain both <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-semibold">order_id</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-semibold">email</code> parameters.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  await connectDB();

  // The order ID will be checked within the global fetch later
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get("payonaire_access_token")?.value;

  let currentDeviceKey: string | null = null;
  if (existingCookie) {
    try {
      const decoded = jwt.verify(existingCookie, process.env.JWT_SECRET!) as {
        deviceKey: string;
      };
      currentDeviceKey = decoded.deviceKey;
    } catch {
      // Ignored: cookie might be expired or tampered with
    }
  }

  // --- GLOBAL EMAIL DEVICE LOCK CHECK ---
  const normalizedEmail = email.trim().toLowerCase();
  
  // Find all orders for this email case-insensitively
  const allUserOrders = await ClaimedOrder.find({ email: new RegExp(`^${normalizedEmail}$`, "i") }).lean();
  const claimedOrder = allUserOrders.find((o: any) => o.orderId === orderId);

  // Check if there is ANY active lock for this user
  const activeLockOrder = allUserOrders.find(
    (o: any) => o.deviceKey !== "reset-by-admin" && o.deviceKey !== "reset-by-logout"
  );

  if (activeLockOrder) {
    if (activeLockOrder.deviceKey !== currentDeviceKey) {
      // User has an active lock on ANOTHER device. Block access completely!
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground text-center max-w-md mx-auto">
          <Card className="w-full border-destructive shadow-xl">
            <CardHeader className="flex flex-col items-center gap-2">
              <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-2">
                <ShieldAlert className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your account has already been activated and locked to another device or browser.
              </p>
              <div className="p-3 bg-muted rounded-lg text-left text-xs space-y-2 text-muted-foreground">
                <p>⚠️ For security, course access is restricted to a single browser activation across all your purchases.</p>
                <p>🔧 If you cleared your browser cookies or need to switch to another device, please ask support to reset your activation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // If this specific order is already active on this device, just redirect
  if (claimedOrder && claimedOrder.deviceKey === currentDeviceKey) {
    redirect("/");
  }

  // --- NEW ACTIVATION (FIRST TIME OR RESET) ---
  return <AutoActivate orderId={orderId} email={normalizedEmail} name={name} />;
}
