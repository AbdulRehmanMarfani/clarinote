import { AppShell } from "@/components/AppShell";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <SettingsForm />
      </div>
    </AppShell>
  );
}
