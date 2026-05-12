import { requireCurrentUser } from "@/lib/auth/session";
import { SettingsShell } from "@/components/dashboard/settings";

export default async function SettingsPage() {
  const user = await requireCurrentUser();

  return (
    <main className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-5">
        <h1 className="text-sm font-medium">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SettingsShell user={user} />
      </div>
    </main>
  );
}
