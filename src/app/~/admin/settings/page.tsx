import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./_components/SettingsForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/login");
  }

  const settings = await getSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage group links and other application settings.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
