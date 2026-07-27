import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./_components/SettingsForm";
import { getAuthSession } from "@/lib/auth/getAuthSession";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await getAuthSession();

  if (!session?.email || session.role !== "admin") {
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
