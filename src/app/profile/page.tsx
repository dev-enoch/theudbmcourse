import { getAuthSession } from "@/lib/auth/getAuthSession";
import { redirect } from "next/navigation";
import AppLayout from "@/components/common/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, ShieldCheck } from "lucide-react";
import { connectDB } from "@/lib/mongoose";
import UserModel from "@/models/User";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  await connectDB();
  const dbUser = await UserModel.findById(session.userId).lean();
  const languagePreference = dbUser?.languagePreference as "ha" | "en" | undefined;
  const dict = dictionaries[languagePreference || "en"];

  return (
    <AppLayout dict={dict} currentLanguage={languagePreference || "en"}>
      <div className="container mx-auto px-4 py-8 max-w-md mt-10">
        <Card className="w-full shadow-lg border-primary/10">
          <CardHeader className="flex flex-col items-center gap-2 pt-10">
            <div className="p-4 bg-primary/10 text-primary rounded-full mb-2">
              <User className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {dict?.nav?.profile || "My Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-semibold">{session.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Role</span>
                <span className="text-sm font-semibold capitalize">{session.role}</span>
              </div>
            </div>

            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
